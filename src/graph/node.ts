import {Universe} from '../dimensions';

import {denyOverrides, parseRuleSpec} from '../rules';

import {Disjunction, Simplifier} from '../setops';

import {Edge} from './edge';
import {PoolRule, parsePoolRuleSpec} from './pool_rule';
import {RoutingRule, parseRoutingRuleSpec} from './routing_rule';
import {RuleSpec} from '../rules';
import {AnyRuleSpec, NodeSpec} from './types';

export enum NodeType {
  PUBLIC_ENDPOINT,
  INBOUND,
  OUTBOUND,
}

///////////////////////////////////////////////////////////////////////////////
//
// Node is the static graph representation of a NodeSpec. Its primary data
// structure is a set of outboundEdges, computed by interpreting the `filters`
// and `rules` fields of a NodeSpec.
//
///////////////////////////////////////////////////////////////////////////////
export class Node {
  readonly key: string;
  readonly spec: NodeSpec;
  readonly range: Disjunction<RuleSpec>;
  readonly isEndpoint: boolean;

  readonly outboundEdges: Array<Edge> = [];

  constructor(
    universe: Universe,
    simplifier: Simplifier<AnyRuleSpec>,
    spec: NodeSpec
  ) {
    this.spec = spec;
    this.key = spec.key;
    this.isEndpoint = !!spec.endpoint;

    this.range = Disjunction.universe<RuleSpec>();

    let filters: Disjunction<RuleSpec>;
    if (this.spec.filters) {
      const rules = this.spec.filters.map(r => {
        // TODO: sort out correct `id` and `source`.
        return parseRuleSpec(universe, {...r, id: 1, source: 'source'});
      });

      filters = denyOverrides(rules, simplifier as Simplifier<RuleSpec>);
    } else {
      // TODO: sort out RuleSpec vs RuleSpecEx
      filters = Disjunction.universe<RuleSpec>();
    }

    const forwardRules = spec.routes.map(r =>
      parseRoutingRuleSpec(universe, simplifier as Simplifier<RuleSpec>, r)
    );
    const poolRules = (spec.pool || []).map(r =>
      parsePoolRuleSpec(universe, r)
    );
    this.createEdges(simplifier, filters, forwardRules, poolRules);
  }

  createEdges(
    simplifier: Simplifier<AnyRuleSpec>,
    filters: Disjunction<RuleSpec>,
    forwardRules: RoutingRule[],
    poolRules: PoolRule[]
  ) {
    // NOTE that multiple rules may forward to the same node.
    // Use keyToRoute map to combine those routes going a single node.
    const keyToRoute = new Map<string, Disjunction<AnyRuleSpec>>();
    let remaining: Disjunction<AnyRuleSpec> = filters;
    for (const rule of forwardRules) {
      const allowed = Disjunction.create<AnyRuleSpec>([rule.conjunction]);
      const current = allowed
        .intersect(remaining, simplifier)
        .intersect(rule.filters);
      remaining = remaining.subtract(allowed, simplifier);

      if (rule.override) {
        // Don't merge routes that have overrides because the overrides
        // may be different. We need to know the specific overrides during
        // back propagation.
        const edge: Edge = {
          from: this.key,
          to: rule.destination,
          override: rule.override,
          routes: current,
        };
        this.outboundEdges.push(edge);
      } else {
        // Merge routes that don't have overrides.
        let routes = keyToRoute.get(rule.destination);
        if (routes) {
          routes = routes.union(current, simplifier);
        } else {
          routes = current;
        }
        keyToRoute.set(rule.destination, current);
      }
    }

    // Add an edge for each node in keyToRoute.
    for (const [to, routes] of keyToRoute.entries()) {
      const edge: Edge = {from: this.key, to, routes};
      this.outboundEdges.push(edge);
    }

    // Add an edge for each of the poolRules.
    for (const rule of poolRules) {
      const edge: Edge = {
        from: this.key,
        to: rule.destination,
        override: rule.override,
        routes: remaining,
      };
      // console.log(JSON.stringify(edge, null, 2));
      this.outboundEdges.push(edge);
    }
  }

  getType(): NodeType | undefined {
    // TODO: update this code once the Node.type field has been added.
    if (this.key.endsWith('/endpoint')) {
      return NodeType.PUBLIC_ENDPOINT;
    } else if (this.key.endsWith('/outbound')) {
      return NodeType.OUTBOUND;
    } else if (this.key.endsWith('/inbound')) {
      return NodeType.INBOUND;
    } else {
      return undefined;
    }
  }
}
