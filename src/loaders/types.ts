import {Disjunction, Simplifier} from '../setops';

import {Rule} from './rule';

export type Evaluator<A> = (rules: Rule[], simplifier?: Simplifier<A>) => Disjunction<A>;
