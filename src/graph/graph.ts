import {Universe} from '../dimensions';
import {Disjunction, Simplifier} from '../setops';

import {Edge} from './edge';
import {Node} from './node';
import {AnyRuleSpec, GraphSpec, NodeSpec} from './types';

export interface Path {
  // Index of node that this path goes to.
  node: number;

  // Last edge in this path.
  edge?: FlowEdge;

  // Previous step on the path. Undefined if this is the path
  // that supplies the initial routes to the first node.
  previous: Path | undefined;

  // Routes that flow along this path.
  routes: Disjunction<AnyRuleSpec>;
}

export interface FlowNode {
  node: Node;
  paths: Path[];
  routes: Disjunction<AnyRuleSpec>;

  // Used for cycle detection.
  // True when this FlowNode is currently on the preorder search stack.
  active: boolean;
}

interface FlowEdge {
  edge: Edge;
  to: number;
}

export type Cycle = Path[];

interface FlowAnalysis {
  cycles: Cycle[];
  flows: FlowNode[];
}

export interface GraphFormattingOptions {
  backProject?: boolean;
  outbound?: boolean;
  showPaths?: boolean;
  verbose?: boolean;
}

export class Graph {
  simplifier: Simplifier<AnyRuleSpec>;
  nodes: Node[];
  keyToIndex = new Map<string, number>();
  inboundTo: FlowEdge[][];
  outboundFrom: FlowEdge[][] = [];

  constructor(
    simplifier: Simplifier<AnyRuleSpec>,
    nodes: IterableIterator<Node>
  ) {
    this.simplifier = simplifier;

    // Index nodes by node.key and position in interator sequence.
    this.nodes = [...nodes];
    for (const [index, node] of this.nodes.entries()) {
      if (this.keyToIndex.has(node.key)) {
        const message = `Duplicate node key "${node.key}".`;
        throw new TypeError(message);
      }
      this.keyToIndex.set(node.key, index);
    }

    // Index edges by `from` field.
    for (const node of this.nodes) {
      const outboundEdges = node.outboundEdges.map(edge => ({
        edge,
        to: this.nodeIndex(edge.to),
      }));
      this.outboundFrom.push(outboundEdges);
    }

    // Index edges by `to` field.
    this.inboundTo = this.nodes.map(() => []);
    for (const [index, node] of this.nodes.entries()) {
      for (const edge of node.outboundEdges) {
        // DESIGN NOTE: the inbound edges are used for tracing flows backwards.
        // Therefore, the `to` field is set to the index of the edge's from
        // vertex. This allows analyze to run with either forward or backward
        // propagations.
        this.inboundTo[this.nodeIndex(edge.to)].push({edge, to: index});
      }
    }
  }

  analyze(
    startKey: string,
    outbound: boolean,
    modelSpoofing = false
  ): FlowAnalysis {
    const cycles: Cycle[] = [];

    const flows: FlowNode[] = this.nodes.map(node => ({
      node,
      paths: [],
      routes: Disjunction.emptySet<AnyRuleSpec>(),
      active: false,
    }));

    const index = this.nodeIndex(startKey);
    const range = modelSpoofing
      ? Disjunction.universe<AnyRuleSpec>()
      : this.nodes[index].range;

    const path: Path = {
      node: index,
      routes: range,
      previous: undefined,
    };
    const edges = outbound ? this.outboundFrom : this.inboundTo;
    this.propagate(index, path, flows, edges, cycles);

    return {cycles, flows};
  }

  propagate(
    index: number,
    path: Path,
    flowNodes: FlowNode[],
    flowEdges: FlowEdge[][],
    cycles: Path[][]
  ) {
    const flowNode = flowNodes[index];
    if (path.previous) {
      flowNode.routes = flowNode.routes.union(path.routes, this.simplifier);
      flowNode.paths.push(path);
    }

    if (flowNode.active) {
      if (flowNode.node.isEndpoint) {
        // We've reached an endpoint.
        // Replace its route with the incoming path.
        flowNode.routes = path.routes;
      } else {
        // Found a cycle.
        // Consider marking the path object as a cycle
        // as an alternative to returning cycles.
        cycles.push(this.extractCycle(path, path.routes));
      }
    } else {
      // If we're not at an endpoint or we're at the first node,
      // visit adjancent nodes.
      if (!flowNode.node.isEndpoint || !path.previous) {
        flowNode.active = true;
        for (const edge of flowEdges[index]) {
          let routes = path.routes.intersect(edge.edge.routes, this.simplifier);

          if (edge.edge.override) {
            routes = routes.overrideDimensions(edge.edge.override);
          }

          if (!routes.isEmpty()) {
            this.propagate(
              edge.to,
              {
                edge,
                node: edge.to,
                previous: path,
                routes,
              },
              flowNodes,
              flowEdges,
              cycles
            );
          }
        }
        flowNode.active = false;
      }
    }
  }

  extractCycle(path: Path, routes: Disjunction<AnyRuleSpec>): Path[] {
    const cycle = [path];
    const end = path.node;
    let p = path.previous;
    while (p && p.node !== end) {
      cycle.unshift(p);
      p = p.previous;
    }
    if (!p) {
      const message = 'Internal error creating cycle';
      throw new TypeError(message);
    }
    // DESIGN NOTE: use the routes from the incoming flow, instead
    // of the routes already at p. Those routes were the ones at
    // the start of the cycle. We want to record only the routes
    // that are valid for the entire cycle.
    cycle.unshift({...p, routes});

    return cycle;
  }

  backPropagate(path: Path): Disjunction<AnyRuleSpec> {
    let routes = Disjunction.universe<AnyRuleSpec>();
    let step: Path | undefined = path;
    while (step) {
      if (step.edge) {
        const override = step.edge.edge.override;
        if (override) {
          routes = routes.clearOverrides(override);
        }
        routes = routes.intersect(step.edge.edge.routes);
      }
      step = step.previous;
    }

    return routes;
  }

  nodeIndex(key: string): number {
    const index = this.keyToIndex.get(key);
    if (index === undefined) {
      const message = `Unknown node "${key}".`;
      throw new TypeError(message);
    }
    return index;
  }

  node(key: string): Node {
    return this.nodes[this.nodeIndex(key)];
  }

  formatCycle(cycle: Cycle, verbose = false): string {
    const lines: string[] = [];
    lines.push(cycle.map(step => this.nodes[step.node].key).join(' => '));
    if (verbose) {
      lines.push(cycle[0].routes.format({prefix: '  '}));
    }
    return lines.join('\n');
  }

  formatFlow(
    flowNode: FlowNode,
    outbound: boolean,
    options: GraphFormattingOptions
  ): string {
    const key = flowNode.node.key;
    const routes = flowNode.routes.format({prefix: '    '});

    const lines: string[] = [];
    lines.push(`${key}:`);

    lines.push('  routes:');
    if (routes === '') {
      lines.push('    (no routes)');
    } else {
      lines.push(routes);
    }

    if (options.showPaths) {
      lines.push('');
      if (flowNode.paths.length === 0) {
        lines.push('  paths:');
        lines.push('    (no paths)');
      } else {
        lines.push('  paths:');
        for (const path of flowNode.paths) {
          lines.push(`    ${this.formatPath(path, outbound)}`);

          if (options.backProject) {
            const routes = this.backPropagate(path);
            lines.push(routes.format({prefix: '      '}));
          } else if (options.verbose) {
            lines.push(path.routes.format({prefix: '      '}));
          }
        }
      }
    }

    return lines.join('\n');
  }

  formatPath(path: Path, outbound: boolean): string {
    const keys: string[] = [];
    let p: Path | undefined = path;

    if (outbound) {
      while (p) {
        keys.unshift(this.nodes[p.node].key);
        p = p.previous;
      }
    } else {
      while (p) {
        keys.push(this.nodes[p.node].key);
        p = p.previous;
      }
    }
    return keys.join(' => ');
  }
}

export class GraphBuilder {
  universe: Universe;
  simplifier: Simplifier<AnyRuleSpec>;
  keyToNode = new Map<string, Node>();

  constructor(
    universe: Universe,
    simplifier: Simplifier<AnyRuleSpec>,
    graphSpec: GraphSpec
  ) {
    this.universe = universe;
    this.simplifier = simplifier;

    universe.defineSymbols(graphSpec.symbols);

    const nodeSpecs = graphSpec.nodes;
    for (const spec of nodeSpecs) {
      this.addNode(spec);
    }
  }

  addNode(spec: NodeSpec) {
    const node = new Node(this.universe, this.simplifier, spec);
    if (this.keyToNode.has(node.key)) {
      const message = `Duplicate node key "${node.key}".`;
      throw new TypeError(message);
    }
    this.keyToNode.set(node.key, node);
  }

  removeNode(key: string) {
    if (!this.keyToNode.delete(key)) {
      const message = `Attempted removal of unknown node "${key}".`;
      throw new TypeError(message);
    }
  }

  updateNode(spec: NodeSpec) {
    const node = new Node(this.universe, this.simplifier, spec);
    if (this.keyToNode.has(node.key)) {
      this.keyToNode.set(node.key, node);
    } else {
      const message = `Attempted update of unknown node "${node.key}".`;
      throw new TypeError(message);
    }
  }

  buildGraph(): Graph {
    return new Graph(this.simplifier, this.keyToNode.values());
  }
}
