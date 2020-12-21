import {Universe} from '../dimensions';
import {parseConjunction} from '../loaders';
import {Conjunction, Disjunction, Simplifier} from '../setops';

import {ForwardRuleSpecEx, GraphSpec, NodeSpec} from './types';

///////////////////////////////////////////////////////////////////////////////
//
//
//
///////////////////////////////////////////////////////////////////////////////
export interface ForwardRule {
  conjunction: Conjunction<ForwardRuleSpecEx>;
  destination: string;
}

function parseForwardRuleSpec(
  universe: Universe,
  spec: ForwardRuleSpecEx
): ForwardRule {
  const {destination, ...rest} = spec;
  // TODO: finish implementations
  // const conjunction = parseConjunction(universe, rest, spec);
  throw 0;
}

export interface Edge {
  from: string;
  to: string;
  routes: Disjunction<ForwardRuleSpecEx>;
}

export class Node {
  name: string;
  key: string;

  rules: ForwardRule[];

  inDegree = 0;
  in: Array<Edge> = [];
  out: Array<Edge> = [];

  constructor(universe: Universe, spec: NodeSpec) {
    this.name = spec.name;
    this.key = spec.key;
    this.rules = spec.rules.map(r => parseForwardRuleSpec(universe, r));
  }

  mark() {
    this.inDegree++;
  }

  addIncoming(edge: Edge): boolean {
    this.in.push(edge);
    return this.inDegree === this.in.length;
  }

  forwardMarks(graph: Graph) {
    const destinations = new Set<string>(this.rules.map(x => 'out'));
    for (const key of destinations) {
      graph.node(key).mark();
    }
  }

  forwardRoutes(graph: Graph) {
    // Construct outgoing routes
    const keyToRoute = new Map<string, Disjunction<ForwardRuleSpecEx>>();
    let remaining = Disjunction.universe<ForwardRuleSpecEx>();
    for (const rule of this.rules) {
      const allowed = Disjunction.create([rule.conjunction]);
      const current = allowed.intersect(remaining);
      remaining = remaining.subtract(allowed, graph.simplifier);

      let routes = keyToRoute.get(rule.destination);
      if (routes) {
        routes = routes.union(current);
      } else {
        routes = current;
      }
      keyToRoute.set(rule.destination, current);
    }

    // Add an edge for each outgoing route.
    for (const [to, routes] of keyToRoute.entries()) {
      graph.addEdge({from: this.key, to, routes});
    }
  }
}

export class Graph {
  simplifier: Simplifier<ForwardRuleSpecEx>;
  keyToNode = new Map<string, Node>();
  ready: Node[] = [];
  edges: Edge[] = [];

  constructor(
    universe: Universe,
    graphSpec: GraphSpec,
    simplifier: Simplifier<ForwardRuleSpecEx>
  ) {
    this.simplifier = simplifier;

    // Construct nodes from specifications.
    for (const nodeSpec of graphSpec.nodes) {
      const node = new Node(universe, nodeSpec);
      if (this.keyToNode.has(node.key)) {
        const message = `Duplicate node key "${node.key}"`;
        throw new TypeError(message);
      }
      this.keyToNode.set(node.key, node);
    }

    // Mark incoming edges.
    for (const node of this.keyToNode.values()) {
      node.forwardMarks(this);
    }

    // Enqueue nodes ready for route forwarding.
    for (const node of this.keyToNode.values()) {
      if (node.inDegree === 0) {
        this.ready.push(node);
      }
    }

    if (this.ready.length === 0) {
      const message = 'Graph contains a cycle.';
      throw new TypeError(message);
    }

    // Forward propagate routes
    while (this.ready.length > 0) {
      const node = this.ready.pop()!;
      node.forwardRoutes(this);
    }
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
    const node = this.node(edge.to);
    if (node.addIncoming(edge)) {
      this.ready.push(node);
    }
  }

  node(key: string): Node {
    const node = this.keyToNode.get(key);
    if (!node) {
      const message = `Unknown node "${key}".`;
      throw new TypeError(message);
    }
    return node;
  }

  nodes(): IterableIterator<Node> {
    return this.keyToNode.values();
  }
}
