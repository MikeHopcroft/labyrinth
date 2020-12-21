import DRange from 'drange';
import FastPriorityQueue from 'fastpriorityqueue';

import {Dimension} from '../dimensions';
import {combineSets} from '../utilities';

import {Conjunction} from './conjunction';
import {DimensionedRange} from './dimensioned_range';
import {Disjunction} from './disjunction';

// Set expression simplifier.
//
// Approach is similar to the prime implicant combination phase in the
// Quine-McCluskey algorithm. The main difference is that that algorithm
// unions the sets in the excluded dimension, while Quine-McCluskey
// combines true and false into "don't care" values.
//
// This simplifier currently does not perform an analog to Petrick's
// algorithm. One consequence is that expressions are not always simplified
// to their minimal form. This means that simplification may be needed
// after set intersection. Normally, the intersection of two minimal forms
// results in a minimal form without further simplification.
// TODO: present a proof of above lemma in documentation.
//
// See also this article on boolean expression simplification.
//   https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm
//   https://en.wikipedia.org/wiki/Petrick%27s_method

export type Simplifier<A> = (d: Disjunction<A>) => Disjunction<A>;

interface ConjunctionInfo<A> {
  conjunction: Conjunction<A>;
  factors: FactorInfo<A>[];
}

interface FactorInfo<A> {
  key: string;
  dimension: Dimension;
  conjunction: ConjunctionInfo<A>;
}

interface FactorEntry<A> {
  key: string;
  dimension: Dimension;
  conjunctions: Set<FactorInfo<A>>;
}

// Can't define a type alias here because we want to be able to use new.
//   https://stackoverflow.com/questions/40982470/how-to-alias-complex-type-constructor-in-typescript
class KeyToFactorEntry<A> extends Map<string, FactorEntry<A>> {}

export function simplify<A>(
  dimensions: Dimension[],
  d: Disjunction<A>
): Disjunction<A> {
  const index = new KeyToFactorEntry<A>();
  const queue = new FastPriorityQueue<FactorEntry<A>>((a, b) => {
    return a.conjunctions.size > b.conjunctions.size;
  });
  const terms = new Set<ConjunctionInfo<A>>();

  for (const c of d.conjunctions) {
    const info = createConjunctionInfo(dimensions, c);
    addConjunction(index, queue, terms, info);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // DESIGN NOTE: peek() here, rather than poll(). The entry will
    // be updated when combine() invokes addConjunction() and
    // removeConjunction().
    const entry = queue.peek();
    if (entry === undefined || entry.conjunctions.size < 2) {
      break;
    }

    combine(dimensions, index, queue, terms, entry);
  }

  return Disjunction.create<A>([...terms.values()].map(x => x.conjunction));
}

export function createConjunctionInfo<A>(
  // TODO: replace Dimension[] with DimensionSet object that enforces
  // monotonic ids.
  dimensions: Dimension[],
  conjunction: Conjunction<A>
): ConjunctionInfo<A> {
  const factors: FactorInfo<A>[] = [];
  const info: ConjunctionInfo<A> = {conjunction, factors};

  let i = 0;
  const lines: string[] = [];
  for (const d of dimensions) {
    if (
      i < conjunction.dimensions.length &&
      conjunction.dimensions[i].dimension.id === d.id
    ) {
      lines.push(conjunction.dimensions[i++].fastFormat());
    } else {
      // TODO: this is brittle because it may format different than
      // d.formatter(). Perhaps the DRange parameter to d.formatter()
      // should be optional.
      lines.push(`${d.name}: *`);
    }
  }

  for (const [i, dimension] of dimensions.entries()) {
    const save = lines[i];
    lines[i] = `[${dimension.key}]`;
    const key = lines.join('\n');
    factors.push({
      key,
      dimension: dimension,
      conjunction: info,
    });
    lines[i] = save;
  }

  return info;
}

function combine<A>(
  dimensions: Dimension[],
  index: KeyToFactorEntry<A>,
  queue: FastPriorityQueue<FactorEntry<A>>,
  terms: Set<ConjunctionInfo<A>>,
  entry: FactorEntry<A>
) {
  //
  // Make new, combined conjunction
  //

  const rules = combineSets(
    [...entry.conjunctions.values()].map(c => c.conjunction.conjunction.rules)
  );

  // First merge ranges that are on entry.dimension.
  const dimension = entry.dimension;
  let combinedRange = new DimensionedRange(dimension, new DRange());
  let firstConjunction: Conjunction<A> | undefined = undefined;
  for (const c of entry.conjunctions) {
    if (!firstConjunction) {
      firstConjunction = c.conjunction.conjunction;
    }
    let found = false;
    for (const r of c.conjunction.conjunction.dimensions) {
      if (r.dimension === dimension) {
        combinedRange = combinedRange.union(r);
        found = true;
        break;
      }
    }
    if (!found) {
      // TODO: DimensionedRange contruction could have optional second parameter
      // to specify domain.
      combinedRange = combinedRange.union(
        new DimensionedRange(dimension, dimension.type.domain)
      );
      // const message = `Did not find dimension ${dimension.id}.`;
      // throw new TypeError(message);
    }
  }
  if (!firstConjunction) {
    const message = 'Factor entry has no conjunctions.';
    throw new TypeError(message);
  }

  // Then prepare new list of dimensioned ranges.
  const ranges: DimensionedRange[] = [];
  for (const d of firstConjunction.dimensions) {
    if (d.dimension === entry.dimension) {
      ranges.push(combinedRange);
    } else {
      ranges.push(d);
    }
  }
  const combined = createConjunctionInfo(
    dimensions,
    Conjunction.create(ranges, rules)
  );

  //
  // Then update the index.
  //

  // Remove conjunctions from index
  for (const c of entry.conjunctions) {
    removeConjunction(index, queue, terms, c.conjunction);
  }

  // Add new conjunction to index
  addConjunction(index, queue, terms, combined);
}

function addConjunction<A>(
  index: KeyToFactorEntry<A>,
  queue: FastPriorityQueue<FactorEntry<A>>,
  terms: Set<ConjunctionInfo<A>>,
  conjunction: ConjunctionInfo<A>
) {
  if (terms.has(conjunction)) {
    const message = 'Duplicate conjunction';
    throw new TypeError(message);
  }
  terms.add(conjunction);

  for (const f of conjunction.factors) {
    const entry = index.get(f.key);
    if (entry) {
      if (!queue.removeOne(x => x === entry)) {
        const message = 'Entry not in priority queue';
        throw new TypeError(message);
      }
      entry.conjunctions.add(f);
      queue.add(entry);
    } else {
      const entry: FactorEntry<A> = {
        key: f.key,
        dimension: f.dimension,
        conjunctions: new Set<FactorInfo<A>>([f]),
      };
      index.set(f.key, entry);
      queue.add(entry);
    }
  }
}

function removeConjunction<A>(
  index: KeyToFactorEntry<A>,
  queue: FastPriorityQueue<FactorEntry<A>>,
  terms: Set<ConjunctionInfo<A>>,
  conjunction: ConjunctionInfo<A>
) {
  if (!terms.has(conjunction)) {
    const message = 'Conjunction not found in terms';
    throw new TypeError(message);
  }
  terms.delete(conjunction);

  for (const f of conjunction.factors) {
    const entry = index.get(f.key);
    if (!entry) {
      const message = `Entry not in index:\n${f.key}`;
      throw new TypeError(message);
    }

    if (!queue.removeOne(x => x === entry)) {
      const message = `Entry not in priority queue:\n${f.key}`;
      throw new TypeError(message);
    }
    entry.conjunctions.delete(f);
    queue.add(entry);
  }
}
