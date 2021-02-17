import * as t from 'io-ts';

import {codecRuleSpecNoId, RuleSpec} from '../rules';

const codecForwardRuleSpec = t.intersection([
  t.type({
    destination: t.string,
  }),
  t.partial({
    filters: t.array(codecRuleSpecNoId),
  }),
  t.record(t.string, t.any),
]);
export type ForwardRuleSpec = t.TypeOf<typeof codecForwardRuleSpec>;

export const ForwardRuleSpecReservedWords = new Set<string>([
  'destination',
  'id',
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
