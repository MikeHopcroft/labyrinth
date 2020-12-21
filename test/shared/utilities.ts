import {Dimension} from '../../src/dimensions';
import {Conjunction, Disjunction} from '../../src/setops';

export function disjunctionValues<A>(
  dimensions: Dimension[],
  disjunction: Disjunction<A>
): Set<string> {
  const values = new Set<string>();
  for (const c of disjunction.conjunctions) {
    for (const v of conjunctionValues(dimensions, c)) {
      values.add(`[${v.join(',')}]`);
    }
  }
  return values;
}

function* conjunctionValues<A>(
  dimensions: Dimension[],
  conjunction: Conjunction<A>
): IterableIterator<number[]> {
  const values: number[][] = dimensions.map(
    d => conjunctionDimensionValues(conjunction, d)
  );
  yield* crossProduct(values);
}

function conjunctionDimensionValues<A>(
  c: Conjunction<A>,
  dimension: Dimension
): number[] {
  for (const factor of c.dimensions) {
    if (factor.dimension === dimension) {
      return factor.range.numbers();
    }
  }
  return dimension.type.domain.numbers();
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
