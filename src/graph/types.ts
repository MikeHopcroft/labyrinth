import * as t from 'io-ts';

import {RuleSpecEx, ruleSpecNoIdType} from '../rules';

const forwardRuleSpecType = t.intersection([
  t.type({
    destination: t.string,
  }),
  t.record(t.string, t.string),
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
    filters: t.array(ruleSpecNoIdType)
  }),
]);

export type NodeSpec = t.TypeOf<typeof nodeSpecType>;

export type AnyRuleSpec = RuleSpecEx | ForwardRuleSpecEx;
