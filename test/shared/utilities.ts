import {Dimension} from '../../src/dimensions';
import {Conjunction, Disjunction} from '../../src/setops';

export function disjunctionValues(
  dimensions: Dimension[],
  disjunction: Disjunction
): Set<string> {
  const values = new Set<string>();
  for (const c of disjunction.conjunctions) {
    for (const v of conjunctionValues(dimensions, c)) {
      values.add(`[${v.join(',')}]`);
    }
  }
  return values;
}

function* conjunctionValues(
  dimensions: Dimension[],
  conjunction: Conjunction
): IterableIterator<number[]> {
  const values: number[][] = dimensions.map(d => conjunction.numbers(d));
  yield* crossProduct(values);
}

export function* crossProduct(
  values: number[][],
  index = 0
): IterableIterator<number[]> {
  if (index === values.length) {
    yield [];
  } else {
    for (const suffix of crossProduct(values, index + 1)) {
      for (const v of values[index]) {
        suffix.unshift(v);
        yield suffix;
        suffix.shift();
      }
    }
  }
}

export function stripLeadingSpaces(text: string) {
  return (
    text
      .split(/\r?\n/)
      .map(l => l.trimLeft())
      // .slice(1)  // Originally for removing first \n.
      .join('\n')
  );
}
