import {Conjunction, Disjunction, Simplifier} from '../setops';

import {Edge} from './edge';
import {Node, NodeType} from './node';
import {AnyRuleSpec} from './types';

function log(verbose: boolean, message: string) {
  if (verbose) {
    console.log(message);
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Path represents a sequence of FlowEdges, paired with the flows (routes)
// along those edges.
//
///////////////////////////////////////////////////////////////////////////////
export interface Path {
  // Last edge in this path.
  edge: FlowEdge;

  // Previous step on the path. Undefined when this is the first step.
  previous: Path | undefined;

  // Routes that flow along this path.
  routes: Disjunction<AnyRuleSpec>;
}

///////////////////////////////////////////////////////////////////////////////
//
// FlowNode groups a Node with the paths and flows (routes) computed during
// forward propagation. FlowNode also includes an `active` mark, which is used
// to detect cycles during forward propagation.
//
///////////////////////////////////////////////////////////////////////////////
export interface FlowNode {
  node: Node;
  paths: Path[];
  routes: Disjunction<AnyRuleSpec>;

  // Used for cycle detection.
  // True when this FlowNode is currently on the preorder search stack.
  active: boolean;
}

///////////////////////////////////////////////////////////////////////////////
//
// FlowEdge groups an Edge with the index of its `to` Node. FlowEdge exists to
// reduce the number of node lookups from Graph.keyToIndex.
//
///////////////////////////////////////////////////////////////////////////////
interface FlowEdge {
  edge: Edge;
  to: number;
}

// Type alias `Cycle` defined to allow easier redefinition of Cycle type it we
// choose, in the future, to use a data structure other than a Path[].
export type Cycle = Path[];

// Graph.analyze() returns a collection of FlowNodes (Nodes grouped with their
// flows and paths) and a set of Cycles.
interface FlowAnalysis {
  cycles: Cycle[];
  flows: FlowNode[];
}

export interface GraphFormattingOptions {
  // When formatting paths, back-project to show pre-NAT flows.
  backProject?: boolean;

  // The value of the `outbound` parameter passed to Graph.analyze().
  // Specifies whether paths should be formatted in forward order or reverse.
  outbound?: boolean;

  // Specifies whether Graph.formatFlow() should display information about
  // individual paths.
  showPaths?: boolean;

  // Specifies whether Graph.formatPath() should display flows (routes) for
  // each path.
  verbose?: boolean;

  // Specifices whether to shorten paths and collapse paths based on their
  // key prefix:
  // Before
  //  ip => vnet/router => vnet/inbound => vm/inbound
  // Shortened
  // ip => vnet => vm
  shortenAndCollapse?: boolean;
}

export class Graph {
  private readonly simplifier: Simplifier<AnyRuleSpec>;
  readonly nodes: Node[];
  private readonly keyToIndex = new Map<string, number>();
  private readonly inboundTo: FlowEdge[][];
  private readonly outboundFrom: FlowEdge[][] = [];

  private readonly friendlyNameToNode = new Map<string, Node[]>();

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

      const friendlyName = node.spec.friendlyName ?? node.key;
      const sameFriendly = this.friendlyNameToNode.get(friendlyName);
      if (sameFriendly) {
        sameFriendly.push(node);
      } else {
        this.friendlyNameToNode.set(friendlyName, [node]);
      }
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
    const flowNodes: FlowNode[] = this.nodes.map(node => ({
      node,
      paths: [],
      routes: Disjunction.emptySet<AnyRuleSpec>(),
      active: false,
    }));

    const index = this.nodeIndex(startKey);
    const initialFlow = modelSpoofing
      ? Disjunction.universe<AnyRuleSpec>()
      : this.nodes[index].range;

    const initialPath = undefined;
    const flowEdges = outbound ? this.outboundFrom : this.inboundTo;
    const cycles: Cycle[] = [];

    this.propagate(
      index,
      initialFlow,
      initialPath,
      flowNodes,
      flowEdges,
      cycles,
      outbound
    );

    return {cycles, flows: flowNodes};
  }

  private propagate(
    fromIndex: number,
    flow: Disjunction<AnyRuleSpec>,
    path: Path | undefined,
    flowNodes: FlowNode[],
    flowEdges: FlowEdge[][],
    cycles: Path[][],
    forwardTraversal: boolean
  ) {
    const verbose = false;
    const flowNode = flowNodes[fromIndex];

    log(verbose, `propagate(${flowNode.node.key})`);
    log(verbose, '  flow:');
    log(verbose, flow.format({prefix: '    '}));

    if (path) {
      // If we're not at the start node, combine the inbound flow with existing
      // flow and add the path to the node's collection of existing paths.
      flowNode.routes = flowNode.routes.union(flow, this.simplifier);
      flowNode.paths.push(path);

      log(verbose, '  flowNode.routes:');
      log(verbose, flowNode.routes.format({prefix: '    '}));
    }

    if (flowNode.active) {
      // We've encountered the active path.
      if (flowNode.node.isEndpoint) {
        // We've cycled back to an endpoint.
        // This is not a cycle since an endpoint is not a router.
        // Replace its route with the incoming path.
        flowNode.routes = flow;
      } else {
        // Found a cycle.
        // Consider marking the path object as a cycle
        // as an alternative to returning cycles.
        // NOTE: `path` cannot be undefined when flowNode.active.
        const cycle = this.extractCycle(path!, flow);
        if (this.isNATCycle(cycle)) {
          const message = `Encountered NAT cycle:\n${this.formatCycle(
            cycle,
            true
          )}`;
          throw new TypeError(message);
        }
        cycles.push(cycle);
      }
    } else {
      // If we're not at an endpoint or we're at the first node,
      // visit adjacent nodes.
      if (!flowNode.node.isEndpoint || !path) {
        flowNode.active = true;

        for (const edge of flowEdges[fromIndex]) {
          let overrideFlow = flow;

          if (!forwardTraversal && edge.edge.override) {
            const cleared = this.clearOverrides(
              overrideFlow,
              edge.edge.override
            );
            if (cleared.isEmpty()) {
              continue;
            } else {
              overrideFlow = cleared;
            }
          }

          log(verbose, `  edge to ${edge.edge.to}`);
          log(verbose, '    intersect:');
          log(verbose, edge.edge.routes.format({prefix: '      '}));
          log(verbose, '    with overrideFlow:');
          log(verbose, overrideFlow.format({prefix: '      '}));

          let routes = overrideFlow.intersect(
            edge.edge.routes,
            this.simplifier
          );

          log(verbose, '    result routes:');
          log(verbose, routes.format({prefix: '      '}));

          if (forwardTraversal && edge.edge.override) {
            routes = routes.overrideDimensions(edge.edge.override);
          }

          if (!routes.isEmpty()) {
            this.propagate(
              edge.to,
              routes,
              {
                edge,
                previous: path,
                routes,
              },
              flowNodes,
              flowEdges,
              cycles,
              forwardTraversal
            );
          }
        }
        flowNode.active = false;
      }
    }
  }

  private extractCycle(path: Path, routes: Disjunction<AnyRuleSpec>): Path[] {
    const cycle = [path];
    const end = path.edge.to;
    let p = path.previous;
    while (p && p.edge.to !== end) {
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

  private isNATCycle(cycle: Cycle) {
    for (const current of cycle) {
      if (current.edge.edge.override) {
        return true;
      }
    }
    return false;
  }

  //
  // Compute the flow along the path, as viewed from the start of the path.
  // This flow does not have any NAT or port mapping applied.
  //
  backProjectAlongPath(path: Path): Disjunction<AnyRuleSpec> {
    const verbose = false;
    log(
      verbose,
      '============================= backProjectAlongPath ==========================='
    );
    let routes = Disjunction.universe<AnyRuleSpec>();
    let step: Path | undefined = path;
    while (step) {
      if (step.edge) {
        log(
          verbose,
          `===Edge from ${step.edge.edge.from} to ${step.edge.edge.to}===`
        );
        const override = step.edge.edge.override;
        if (override) {
          log(verbose, '  override');
          log(verbose, '    clearOverride:');
          log(verbose, override.format({prefix: '      '}));
          routes = this.clearOverrides(routes, override);
          log(verbose, '  ');
          log(verbose, '    routes:');
          log(verbose, routes.format({prefix: '      '}));
        }
        log(verbose, '  intersect');
        log(verbose, '    with');
        log(verbose, step.edge.edge.routes.format({prefix: '      '}));
        routes = routes.intersect(step.edge.edge.routes, this.simplifier);
        log(verbose, '  ');
        log(verbose, '    routes:');
        log(verbose, routes.format({prefix: '      '}));
      }
      step = step.previous;
    }

    return routes;
  }

  private clearOverrides(
    routes: Disjunction<AnyRuleSpec>,
    override: Conjunction<AnyRuleSpec>
  ): Disjunction<AnyRuleSpec> {
    const cleared: Conjunction<AnyRuleSpec>[] = [];
    for (const term of routes.conjunctions) {
      if (!term.intersect(override).isEmpty()) {
        cleared.push(term.clearOverrides(override));
      }
    }
    return Disjunction.create<AnyRuleSpec>(cleared);
  }

  private nodeIndex(key: string): number {
    const index = this.keyToIndex.get(key);
    if (index === undefined) {
      const message = `Unknown node "${key}".`;
      throw new TypeError(message);
    }
    return index;
  }

  // Similar to withKey(), but throws if node is not found.
  node(key: string): Node {
    return this.nodes[this.nodeIndex(key)];
  }

  formatCycle(cycle: Cycle, verbose = false): string {
    const lines: string[] = [];
    lines.push(cycle.map(step => this.nodes[step.edge.to].key).join(' => '));
    if (verbose) {
      lines.push(cycle[0].routes.format({prefix: '  '}));
    }
    return lines.join('\n');
  }

  formatFlow(flowNode: FlowNode, options: GraphFormattingOptions): string {
    const outbound = !!options.outbound;

    const routesForPaths: Array<Disjunction<AnyRuleSpec>> = [];
    let totalFlow = Disjunction.emptySet<AnyRuleSpec>();
    if (options.backProject && outbound) {
      for (const path of flowNode.paths) {
        const route = this.backProjectAlongPath(path);
        routesForPaths.push(route);
        totalFlow = totalFlow.union(route, this.simplifier);
      }
    } else {
      for (const path of flowNode.paths) {
        routesForPaths.push(path.routes);
      }
      totalFlow = flowNode.routes;
    }

    const lines: string[] = [];
    lines.push(`${formatNodeName(flowNode.node)}:`);

    const flow = totalFlow.format({prefix: '    '});
    lines.push('  flow:');
    if (flow === '') {
      lines.push('    (no flow)');
    } else {
      lines.push(flow);
    }

    if (options.showPaths) {
      lines.push('');
      if (flowNode.paths.length === 0) {
        lines.push('  paths:');
        lines.push('    (no paths)');
      } else {
        lines.push('  paths:');
        for (const [i, path] of flowNode.paths.entries()) {
          lines.push(`    ${this.formatPath(path, outbound, options)}`);
          lines.push(routesForPaths[i].format({prefix: '      '}));
        }
      }
    }

    return lines.join('\n');
  }

  formatPath(
    path: Path,
    outbound: boolean,
    options: GraphFormattingOptions
  ): string {
    const keys: string[] = [];
    let p: Path | undefined = path;

    if (outbound) {
      while (p) {
        keys.unshift(p.edge.edge.to);
        if (!p.previous) {
          keys.unshift(p.edge.edge.from);
        }
        p = p.previous;
      }
    } else {
      keys.push(p.edge.edge.from);
      while (p) {
        keys.push(p.edge.edge.to);
        p = p.previous;
      }
    }

    return keys
      .map(key => {
        const node = this.node(key);
        return options.shortenAndCollapse
          ? node.spec.friendlyName ?? node.key
          : node.key;
      })
      .filter(
        (step, index, steps) =>
          !options.shortenAndCollapse ||
          index === 0 ||
          steps[index - 1] !== step
      )
      .join(' => ');
  }

  *friendlyNames(): IterableIterator<string> {
    yield* this.friendlyNameToNode.keys();
  }

  withFriendlyName(friendlyName: string) {
    const nodes = this.friendlyNameToNode.get(friendlyName) ?? [];
    return {
      all: () => nodes,
      endpoints: () => nodes.filter(node => node.isEndpoint),
      withType: (type: NodeType): Node | undefined => {
        for (const node of nodes) {
          if (type === node.getType()) {
            return node;
          }
        }
        return undefined;
      },
    };
  }

  // Similar to node(), but returns undefined if node is not found.
  withKey(key: string): Node | undefined {
    const index = this.keyToIndex.get(key);
    if (index !== undefined) {
      return this.nodes[index];
    }
    return undefined;
  }
}

export function formatNodeName(node: Node): string {
  if (
    node.key === node.spec.friendlyName ||
    node.spec.friendlyName === undefined
  ) {
    return node.key;
  } else {
    return `${node.spec.friendlyName} (${node.key})`;
  }
}
