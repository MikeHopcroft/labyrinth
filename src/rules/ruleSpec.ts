import * as t from 'io-ts';

// createEnum() from https://github.com/gcanti/io-ts/issues/67
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodeEnum = <E>(e: any, name: string): t.Type<E> => {
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
const decodeActionType = decodeEnum<ActionType>(ActionType, 'ActionType');

export const codecRuleSpecNoId = t.intersection([
  t.type({
    action: decodeActionType,
    priority: t.number,
  }),
  t.record(t.string, t.any),
]);

export const codecRuleSpec = t.intersection([
  codecRuleSpecNoId,
  t.type({
    id: t.number,
    source: t.string,
  }),
]);

export type RuleSpec = t.TypeOf<typeof codecRuleSpec>;

export const RuleSpecReservedWords = new Set<string>([
  'action',
  'id',
  'source',
  'priority',
]);

export const codecRuleSpecNoIdSet = t.type({
  rules: t.array(codecRuleSpecNoId),
});

export const codecRuleSpecSet = t.type({
  rules: t.array(codecRuleSpec),
});

export type RuleSpecSet = t.TypeOf<typeof codecRuleSpecSet>;
