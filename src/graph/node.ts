import {Universe} from '../dimensions';
import {denyOverrides, parseRuleSpec} from '../rules';
import {Disjunction, Simplifier} from '../setops';

import {Edge} from './edge';
import {ForwardRule, parseForwardRuleSpec} from './forward_rule';
import {RuleSpec} from '../rules';
import {AnyRuleSpec, NodeSpec} from './types';

export class Node {
  spec: NodeSpec;
  name: string;
  key: string;
  filters: Disjunction<RuleSpec>;
  rules: ForwardRule[];
  isEndpoint: boolean;

  outboundEdges: Array<Edge> = [];

  constructor(
    universe: Universe,
    simplifier: Simplifier<AnyRuleSpec>,
    spec: NodeSpec
  ) {
    this.spec = spec;
    this.name = spec.name ?? spec.key;
    this.key = spec.key;
    this.isEndpoint = !!spec.endpoint;

    if (this.spec.filters) {
      const rules = this.spec.filters.map(r => {
        // TODO: sort out correct `id` and `source`.
        return parseRuleSpec(universe, {...r, id: 1, source: 'source'});
      });

      this.filters = denyOverrides(rules, simplifier as Simplifier<RuleSpec>);
    } else {
      // TODO: sort out RuleSpec vs RuleSpecEx
      this.filters = Disjunction.universe<RuleSpec>();
    }

    this.rules = spec.rules.map(r => 
      parseForwardRuleSpec(universe, simplifier as Simplifier<RuleSpec>, r)
    );

    this.createEdges(simplifier);
  }

  // Constructs outgoing edges
  createEdges(simplifier: Simplifier<AnyRuleSpec>) {
    // NOTE that multiple rules may forward to the same node.
    // Use keyToRoute map to combine those routes going a single node.
    const keyToRoute = new Map<string, Disjunction<AnyRuleSpec>>();
    let remaining: Disjunction<AnyRuleSpec> = this.filters;
    for (const rule of this.rules) {
      const allowed = Disjunction.create<AnyRuleSpec>([rule.conjunction]);
      const current = allowed.intersect(
        remaining,
        simplifier
      ).intersect(rule.filters);
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
