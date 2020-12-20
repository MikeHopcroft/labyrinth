import {Disjunction, Simplifier} from '../setops';

import {Rule} from './rule';

export type Evaluator = (
  rules: Rule[],
  simplifier?: Simplifier
) => Disjunction;
