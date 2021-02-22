import * as t from 'io-ts';

// createEnum() from https://github.com/gcanti/io-ts/issues/67
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createEnum = <E>(e: any, name: string): t.Type<E> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keys: any = {};
  Object.keys(e).forEach(k => {
    keys[e[k]] = null;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return t.keyof(keys, name) as any;
};

export enum ActionType {
  ALLOW = 'allow',
  DENY = 'deny',
}

// tslint:disable-next-line:variable-name
const ActionTypeType = createEnum<ActionType>(ActionType, 'ActionType');

// Type of a set of dimension constraints.
// The keys in this object must be dimension keys from the associated Universe.
// The values should be strings with range expressions.
// TODO: investigate why t.record(t.string, t.string) doesn't work.
export const constraintType = t.record(t.string, t.unknown);
export type Contraint = t.TypeOf<typeof constraintType>;

export const ruleSpecNoIdType = t.intersection([
  t.type({
    action: ActionTypeType,
    priority: t.number,
  }),
  t.record(t.string, t.any),
]);

export const ruleSpecType = t.intersection([
  ruleSpecNoIdType,
  t.type({
    id: t.number,
    source: t.string,
  }),
]);

export type RuleSpec = t.TypeOf<typeof ruleSpecType>;

export const RuleSpecReservedWords = new Set<string>([
  'action',
  'id',
  'source',
  'priority',
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuleSpecEx = RuleSpec & {[others: string]: any};

export const ruleSpecNoIdSetType = t.type({
  rules: t.array(ruleSpecNoIdType),
});

export const ruleSpecSetType = t.type({
  rules: t.array(ruleSpecType),
});

export type RuleSpecSet = t.TypeOf<typeof ruleSpecSetType>;
