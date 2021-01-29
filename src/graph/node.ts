import {Universe} from '../dimensions';
import {Disjunction, Simplifier} from '../setops';

import {Edge} from './edge';
import {ForwardRule, parseForwardRuleSpec} from './forward_rule';
import {ForwardRuleSpecEx, NodeSpec} from './types';

export class Node {
  spec: NodeSpec;
  name: string;
  key: string;
  rules: ForwardRule[];
  isEndpoint: boolean;

  outboundEdges: Array<Edge> = [];

  constructor(
    universe: Universe,
    simplifier: Simplifier<ForwardRuleSpecEx>,
    spec: NodeSpec
  ) {
    this.spec = spec;
    this.name = spec.name ?? spec.key;
    this.key = spec.key;
    this.isEndpoint = !!spec.endpoint;
    this.rules = spec.rules.map(r => parseForwardRuleSpec(universe, r));

    this.createEdges(simplifier);
  }

  // Constructs outgoing edges
  createEdges(simplifier: Simplifier<ForwardRuleSpecEx>) {
    // NOTE that multiple rules may forward to the same node.
    // Use keyToRoute map to combine those routes going a single node.
    const keyToRoute = new Map<string, Disjunction<ForwardRuleSpecEx>>();
    let remaining = Disjunction.universe<ForwardRuleSpecEx>();
    for (const rule of this.rules) {
      const allowed = Disjunction.create([rule.conjunction]);
      const current = allowed.intersect(remaining, simplifier);
      remaining = remaining.subtract(allowed, simplifier);

      let routes = keyToRoute.get(rule.destination);
      if (routes) {
        routes = routes.union(current, simplifier);
      } else {
        routes = current;
      }
      keyToRoute.set(rule.destination, current);
    }

    // Add an edge for each node in keyToRoute.
    for (const [to, routes] of keyToRoute.entries()) {
      const edge: Edge = {from: this.key, to, routes};
      this.outboundEdges.push(edge);
    }
  }
}
