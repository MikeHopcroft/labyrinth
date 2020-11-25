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

const ruleSpecType = t.type({
  action: ActionTypeType,
  priority: t.number,
});

export type RuleSpec = t.TypeOf<typeof ruleSpecType>;
export type RuleSpecEx = RuleSpec & { [others: string]: any; };

const ruleSpecSetType = t.type({
  rules: t.array(ruleSpecType),
});

export type RuleSpecSet = t.TypeOf<typeof ruleSpecSetType>;
