import * as t from 'io-ts';

import {codecConstraint, codecRuleSpecNoId, RuleSpec} from '../rules';

const codecPoolRuleSpec = t.type({
  destination: t.string,
  override: codecConstraint,
});
export type PoolRuleSpec = t.TypeOf<typeof codecPoolRuleSpec>;

const codecRoutingRuleSpec = t.intersection([
  t.type({
    destination: t.string,
  }),
  t.partial({
    constraints: codecConstraint,
    filters: t.array(codecRuleSpecNoId),
    override: codecConstraint,
  }),
]);
export type RoutingRuleSpec = t.TypeOf<typeof codecRoutingRuleSpec>;

// DESIGN NOTE: SimpleRoutingRuleSpec is used to indicate that the spec
// contains a constraint that consists solely of a destinationIp. The use case
// is forming the union of the destinationIp values across a collection of
// constraints.
//
// WARNING: the only safe and correct way to compute the union of constraints
// is to parse them into Conjunctions, then perform the union, then serialize
// them out. In certain situations it may be permissible to union the text in
// the destinationIp fields by joining with a comma. When performing this
// textual union, it is important to ensure that none of the destinationIp
// values uses keyworkds like `except`, `any`, `all`, and `*`. Other symbols
// should be safe for union.
export interface SimpleRoutingRuleSpec extends RoutingRuleSpec {
  destination: string;
  constraints: {destinationIp: string};
}

export type AnyRuleSpec = RuleSpec | RoutingRuleSpec;

export const codecNodeSpec = t.intersection([
  t.type({
    key: t.string,
    routes: t.array(codecRoutingRuleSpec),
  }),
  t.partial({
    name: t.string,
    endpoint: t.boolean,
    filters: t.array(codecRuleSpecNoId),
    pool: t.array(codecPoolRuleSpec),
    range: codecConstraint,
  }),
]);

export type NodeSpec = t.TypeOf<typeof codecNodeSpec>;

export const codecSymbolDefinition = t.type({
  dimension: t.string,
  symbol: t.string,
  range: t.string,
});

export type SymbolDefinitionSpec = t.TypeOf<typeof codecSymbolDefinition>;

export const codecGraphSpec = t.type({
  symbols: t.array(codecSymbolDefinition),
  nodes: t.array(codecNodeSpec),
});

export type GraphSpec = t.TypeOf<typeof codecGraphSpec>;
