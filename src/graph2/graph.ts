import {flow} from 'fp-ts/lib/function';
import {Universe} from '../dimensions';
import {Disjunction, Simplifier} from '../setops';

import {Edge} from './edge';
import {Node} from './node';
import {ForwardRuleSpecEx, NodeSpec} from './types';

export interface Path {
  node: number;
  routes: Disjunction<ForwardRuleSpecEx>;
  previous: Path | undefined;
  length: number;
}

export interface FlowNode {
  node: Node;
  paths: Path[];
  routes: Disjunction<ForwardRuleSpecEx>;

  // Used for cycle detection.
  // True when this FlowNode is currently on the inorder search stack.
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

export class Graph {
  simplifier: Simplifier<ForwardRuleSpecEx>;
  nodes: Node[];
  keyToIndex = new Map<string, number>();
  inboundTo: FlowEdge[][];
  outboundFrom: FlowEdge[][] = [];

  constructor(
    simplifier: Simplifier<ForwardRuleSpecEx>,
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
    for (const [i, node] of this.nodes.entries()) {
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

  analyze(startKey: string, outbound: boolean): FlowAnalysis {
    const cycles: Cycle[] = [];

    const flows: FlowNode[] = this.nodes.map(node => ({
      node,
      paths: [],
      routes: Disjunction.emptySet<ForwardRuleSpecEx>(),
      active: false,
    }));

    const index = this.nodeIndex(startKey);
    const path: Path = {
      node: index,
      routes: Disjunction.universe<ForwardRuleSpecEx>(),
      previous: undefined,
      length: 0,
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
    console.log(`============ propagate(index=${index}, pathlength=${path.length}) ===============`)
    console.log(JSON.stringify(path, null, 2));
    // if (path.routes.isEmpty()) {
    //   return;
    // }

    const flowNode = flowNodes[index];
    flowNode.routes = flowNode.routes.union(path.routes, this.simplifier);
    if (path.length > 0) {
      flowNode.paths.push(path);
    }

    if (flowNode.active) {
      if (flowNode.node.isEndpoint) {
        // We've reach an endpoint.
        // Replace its route with the incoming path.
        flowNode.routes = path.routes;
      } else {
        // Found a cycle.
        cycles.push(this.extractCycle(path, path.routes));
      }
    } else {
      // If we're not at an endpoint or we're at the first node,
      // visit adjancent nodes.
      if (!flowNode.node.isEndpoint || path.length == 0) {
        flowNode.active = true;
        for (const edge of flowEdges[index]) {
          const routes = path.routes.intersect(
            edge.edge.routes,
            this.simplifier
          );

          if (!routes.isEmpty()) {
            this.propagate(
              edge.to,
              {
                length: path.length + 1,
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

  extractCycle(path: Path, routes: Disjunction<ForwardRuleSpecEx>): Path[] {
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
    // cycle.unshift(p);

    return cycle;
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

  formatCycle(cycle: Cycle): string {
    return cycle.map(step => this.nodes[step.node].key).join(' => ');
  }

  formatFlow(flowNode: FlowNode, outbound: boolean): string {
    const key = flowNode.node.key;
    const pathCount = flowNode.paths.length;
    const routes = flowNode.routes.format({prefix: '    '});

    const lines: string[] = [];
    lines.push(`${key}:`);

    if (flowNode.paths.length === 0) {
      lines.push('  paths:');
      lines.push('    (entry point)');
    } else {
      lines.push('  paths:');
      for (const path of flowNode.paths) {
        lines.push(`    ${this.formatPath(path, outbound)}`);
      }
    }
    lines.push('');
    lines.push('  routes:');
    lines.push(routes);

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
  simplifier: Simplifier<ForwardRuleSpecEx>;
  keyToNode = new Map<string, Node>();

  constructor(
    universe: Universe,
    simplifier: Simplifier<ForwardRuleSpecEx>,
    nodeSpecs: NodeSpec[]
  ) {
    this.universe = universe;
    this.simplifier = simplifier;

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

  // node(key: string): Node {
  //   return this.index.node(key);
  // }

  // nodes(): IterableIterator<Node> {
  //   return this.index.nodes.values();
  // }

  // format() {
  //   for (const node of this.index.nodes) {
  //     console.log(`Node: ${node.key}:`);
  //     // console.log('  Incoming:');
  //     // // console.log(`  ${node.routes.conjunctions.length} routes`);
  //     // console.log(node.routes.format({ prefix: '    ' }));
  //     // console.log();
  //     // for (const edge of node.in) {
  //     //   console.log(`  From ${edge.from}:`);
  //     //   // console.log('foo');
  //     //   // console.log(`"${edge.routes.format({prefix: '    '})}"`);
  //     //   console.log(edge.routes.format({ prefix: '    ' }));
  //     //   console.log();
  //     // }
  //     console.log();
  //   }
  // }
}
