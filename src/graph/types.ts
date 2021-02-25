import * as t from 'io-ts';

import {codecConstraint, codecRuleSpecNoId, RuleSpec} from '../rules';

const codecPoolRuleSpec = t.type({
  destination: t.string,
  override: codecConstraint,
});
export type PoolRuleSpec = t.TypeOf<typeof codecPoolRuleSpec>;

const codecForwardRuleSpec = t.intersection([
  t.type({
    destination: t.string,
  }),
  t.partial({
    filters: t.array(codecRuleSpecNoId),
    override: codecConstraint,
  }),
  t.record(t.string, t.any),
]);
export type ForwardRuleSpec = t.TypeOf<typeof codecForwardRuleSpec>;

export const ForwardRuleSpecReservedWords = new Set<string>([
  'destination',
  'filters',
  'id',
  'override',
  'source',
]);

export const codecNodeSpec = t.intersection([
  t.type({
    key: t.string,
    rules: t.array(codecForwardRuleSpec),
  }),
  t.partial({
    name: t.string,
    endpoint: t.boolean,
    filters: t.array(codecRuleSpecNoId),
    pool: t.array(codecPoolRuleSpec),
    range: t.record(t.string, t.any),
  }),
]);

export type NodeSpec = t.TypeOf<typeof codecNodeSpec>;

export type AnyRuleSpec = RuleSpec | ForwardRuleSpec;

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
