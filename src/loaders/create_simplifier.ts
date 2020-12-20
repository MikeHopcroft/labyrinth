import {Universe} from '../dimensions';
import {Disjunction, Simplifier, simplify} from '../setops';

export function createSimplifier(universe: Universe): Simplifier {
  return (d: Disjunction) => simplify(universe.dimensions, d);
}

export function nopSimplifier(d: Disjunction) {
  return d;
}
