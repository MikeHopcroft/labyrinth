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
