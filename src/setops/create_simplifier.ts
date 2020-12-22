import {Universe} from '../dimensions';
import {Disjunction} from './disjunction';
import {Simplifier, simplify} from './simplifier';

export function createSimplifier<A>(universe: Universe): Simplifier<A> {
  return (d: Disjunction<A>) => simplify(universe.dimensions, d);
}

export function nopSimplifier<A>(d: Disjunction<A>) {
  return d;
}
