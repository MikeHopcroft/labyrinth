import {Universe} from '../dimensions';
import {Disjunction, Simplifier, simplify} from '../setops';

export function createSimplifier<A>(universe: Universe): Simplifier<A> {
  return (d: Disjunction<A>) => simplify(universe.dimensions, d);
}

export function nopSimplifier<A>(d: Disjunction<A>) {
  return d;
}
