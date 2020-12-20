import {Dimension} from '../dimensions';
import {Disjunction} from '../setops';

import {Rule} from './rule';

export interface EvaluatorOptions {
  simplify?: boolean;
}

export type Evaluator = (
  dimensions: Dimension[],
  rules: Rule[],
  options?: EvaluatorOptions
) => Disjunction;
