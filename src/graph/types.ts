import * as t from 'io-ts';

import {RuleSpecEx, ruleSpecNoIdType} from '../rules';

const forwardRuleSpecType = t.intersection([
  t.type({
    destination: t.string,
  }),
  t.partial({
    filters: t.array(ruleSpecNoIdType),
  }),
  t.record(t.string, t.any),
]);
export type ForwardRuleSpec = t.TypeOf<typeof forwardRuleSpecType>;

// TODO: is ForwardRuleSpecEx even needed when ForwardRuleSpec
// contains [x: string]: string? Also, should [others: string]: any
// really map to any?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ForwardRuleSpecEx = ForwardRuleSpec & {[others: string]: any};

export const ForwardRuleSpecReservedWords = new Set<string>([
  'destination',
  'id',
  'source',
]);

export const nodeSpecType = t.intersection([
  t.type({
    key: t.string,
    rules: t.array(forwardRuleSpecType),
  }),
  t.partial({
    name: t.string,
    endpoint: t.boolean,
    filters: t.array(ruleSpecNoIdType),
    range: t.record(t.string, t.any),
  }),
]);

export type NodeSpec = t.TypeOf<typeof nodeSpecType>;

export type AnyRuleSpec = RuleSpecEx | ForwardRuleSpecEx;

export const symbolDefinitionSpec = t.type({
  dimension: t.string,
  symbol: t.string,
  range: t.string,
});

export type SymbolDefinitionSpec = t.TypeOf<typeof symbolDefinitionSpec>;

export const graphSpecType = t.type({
  symbols: t.array(symbolDefinitionSpec),
  nodes: t.array(nodeSpecType),
});

export type GraphSpec = t.TypeOf<typeof graphSpecType>;
