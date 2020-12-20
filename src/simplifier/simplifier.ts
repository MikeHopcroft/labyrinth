import DRange from 'drange';
import FastPriorityQueue from 'fastpriorityqueue';

import {Dimension} from '../dimensions';
import {Conjunction, DimensionedRange, Disjunction} from '../setops';
import {combineSets} from '../utilities';

import {Hasher} from './hash';

// See also this article on boolean expression simplification.
//   https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm

interface ConjunctionInfo {
  conjunction: Conjunction;
  factors: FactorInfo[];
}

type Key = number;

interface FactorInfo {
  key: Key;
  dimension: Dimension;
  conjunction: ConjunctionInfo;
}

interface FactorEntry {
  key: Key;
  dimension: Dimension;
  conjunctions: Set<FactorInfo>;
}

// Can't define a type alias here because we want to be able to use new.
//   https://stackoverflow.com/questions/40982470/how-to-alias-complex-type-constructor-in-typescript
class KeyToFactorEntry extends Map<Key, FactorEntry> {}

export function simplify2(
  dimensions: Dimension[],
  d: Disjunction
): Disjunction {
  const hasher = new Hasher(1234, 5678);
  const index = new KeyToFactorEntry();
  const queue = new FastPriorityQueue<FactorEntry>((a, b) => {
    return a.conjunctions.size > b.conjunctions.size;
  });
  const terms = new Set<ConjunctionInfo>();

  for (const c of d.conjunctions) {
    const info = createConjunctionInfo(hasher, dimensions, c);
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

    combine(hasher, dimensions, index, queue, terms, entry);
  }

  // console.log(`============ index size: ${index.size} ============`);
  // console.log(`============ queue size: ${queue.size} ============`);

  return Disjunction.create([...terms.values()].map(x => x.conjunction));
}

export function createConjunctionInfo(
  // TODO: replace Dimension[] with DimensionSet object that enforces
  // monotonic ids.
  hasher: Hasher,
  dimensions: Dimension[],
  conjunction: Conjunction
): ConjunctionInfo {
  const factors: FactorInfo[] = [];
  const info: ConjunctionInfo = {conjunction, factors};

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

  const hashes = lines.map(hasher.hash);
  const blanks = dimensions.map((d, i) => {
    const h = hasher.hash(`[${d.key}]`);
    return hasher.xor(hashes[i], h);
  });

  let key = hashes.reduce((accumulator, current) =>
    hasher.xor(accumulator, current)
  );

  for (const [i, dimension] of dimensions.entries()) {
    // const save = lines[i];
    // lines[i] = `[${dimension.key}]`; //'';
    // const key = lines.join('\n');
    key = hasher.xor(key, blanks[i]);
    factors.push({
      key,
      dimension: dimension,
      conjunction: info,
    });
    key = hasher.xor(key, blanks[i]);
    // lines[i] = save;
  }

  return info;
}

function combine(
  hasher: Hasher,
  dimensions: Dimension[],
  index: KeyToFactorEntry,
  queue: FastPriorityQueue<FactorEntry>,
  terms: Set<ConjunctionInfo>,
  entry: FactorEntry
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
  let firstConjunction: Conjunction | undefined = undefined;
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
    hasher,
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

function addConjunction(
  index: KeyToFactorEntry,
  queue: FastPriorityQueue<FactorEntry>,
  terms: Set<ConjunctionInfo>,
  conjunction: ConjunctionInfo
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
      const entry: FactorEntry = {
        key: f.key,
        dimension: f.dimension,
        conjunctions: new Set<FactorInfo>([f]),
      };
      index.set(f.key, entry);
      queue.add(entry);
    }
  }
}

function removeConjunction(
  index: KeyToFactorEntry,
  queue: FastPriorityQueue<FactorEntry>,
  terms: Set<ConjunctionInfo>,
  conjunction: ConjunctionInfo
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

    // Experiment in reducing data structure size.
    // if (entry.conjunctions.size > 1) {
    //   queue.add(entry);
    // } else {
    //   index.delete(f.key);
    // }
  }
}
