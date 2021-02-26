import {Universe} from '../dimensions';
import {Simplifier} from '../setops';

import {Graph} from './graph';
import {Node} from './node';
import {AnyRuleSpec, GraphSpec, NodeSpec} from './types';

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
