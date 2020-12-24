import {Universe} from '../dimensions';
import {Simplifier} from '../setops';

import {Edge} from './edge';
import {Node} from './node';
import {ForwardRuleSpecEx, GraphSpec} from './types';

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
        const message = `Duplicate node key "${node.key}".`;
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
      const message = 'Cycle detected at graph root.';
      throw new TypeError(message);
    }

    // Forward propagate routes
    let processed = 0;
    while (this.ready.length > 0) {
      const node = this.ready.pop()!;
      node.forwardRoutes(this);
      ++processed;
    }
    // if (processed !== this.keyToNode.size) {
    //   const message = 'Graph contains a cycle.';
    //   throw new TypeError(message);
    // }

    // PROBLEM: which node to detect cycles from?
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

  format() {
    for (const node of this.keyToNode.values()) {
      console.log(`Node: ${node.key}:`);
      console.log('  Incoming:');
      // console.log(`  ${node.routes.conjunctions.length} routes`);
      console.log(node.routes.format({prefix: '    '}));
      console.log();
    for (const edge of node.in) {
        console.log(`  From ${edge.from}:`);
        // console.log('foo');
        // console.log(`"${edge.routes.format({prefix: '    '})}"`);
        console.log(edge.routes.format({prefix: '    '}));
        console.log();
      }
      console.log();
    }
  }
}
