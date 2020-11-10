import * as t from 'io-ts';

import {Conjunction, Dimension} from '../setops';

///////////////////////////////////////////////////////////////////////////////
//
// ---
//
///////////////////////////////////////////////////////////////////////////////
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

const ruleSpecType = t.intersection([
  t.type({
    action: ActionTypeType,
    priority: t.number,
  }),
  t.partial({
    sourceIp: t.string,
    sourcePort: t.string,
    destIp: t.string,
    destPort: t.string,
    protocol: t.string,
  }),
]);

export type RuleSpec = t.TypeOf<typeof ruleSpecType>;

const ruleSpecSetType = t.type({
  rules: t.array(ruleSpecType),
});

export type RuleSpecSet = t.TypeOf<typeof ruleSpecSetType>;

export interface Rule {
  action: ActionType;
  priority: number;
  conjunction: Conjunction;
}

export interface RuleDimensions {
  sourceIp: Dimension;
  sourcePort: Dimension;
  destIp: Dimension;
  destPort: Dimension;
  protocol: Dimension;
}
