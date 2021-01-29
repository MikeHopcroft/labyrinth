import * as t from 'io-ts';

const forwardRuleSpecType = t.intersection([
  t.type({
    destination: t.string,
  }),
  t.record(t.string, t.string),
]);
export type ForwardRuleSpec = t.TypeOf<typeof forwardRuleSpecType>;

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
  }),
]);

export type NodeSpec = t.TypeOf<typeof nodeSpecType>;
