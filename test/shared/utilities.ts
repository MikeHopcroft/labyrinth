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
  const values: number[][] = dimensions.map(d =>
    conjunctionDimensionValues(conjunction, d)
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

///////////////////////////////////////////////////////////////////////////////
//
// Function to remove indentation from multi-line template literals.
// Used to simplify authoring expected text output in unit tests.
//
// Example input:
//
//   a = `
//     line one
//       line two
//
//     line three
//   `;
//
// Output: 'line one\n  line two\nline three\n'
//
///////////////////////////////////////////////////////////////////////////////
export function trim(text: string) {
  const lines = text.split(/\n/);
  if (lines.length < 2) {
    return text;
  } else {
    if (lines[0].trim() === '') {
      lines.shift(); // Remove leading blank line
    }

    if (lines[lines.length - 1].trim() === '') {
      lines[lines.length - 1] = '';
      // lines.pop(); // Remove trailing blank line
    }

    const indent = lines[0].length - lines[0].trimStart().length;
    const trimmed = lines.map(line => {
      if (line.length < indent) {
        return line.trimStart();
      } else {
        return line.slice(indent);
      }
    });
    return trimmed.join('\n');
  }
}
