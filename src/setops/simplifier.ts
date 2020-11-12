import DRange from 'drange/types';
import FastPriorityQueue from 'fastpriorityqueue';
import PriorityQueue from 'priorityqueuejs';
import { Conjunction } from "./conjunction";
import { Dimension } from "./dimension";
import { DimensionedRange } from './dimensioned_range';
import { Disjunction } from "./disjunction";

interface ConjunctionInfo {
  conjunction: Conjunction;
  factors: FactorInfo[];
}

interface FactorInfo {
  key: string;
  dimension: Dimension;
  conjunction: ConjunctionInfo;
}

interface FactorEntry {
  key: string;
  dimension: Dimension;
  conjunctions: Set<FactorInfo>;
}

// https://stackoverflow.com/questions/40982470/how-to-alias-complex-type-constructor-in-typescript
class KeyToFactorEntry extends Map<string, FactorEntry> {};


export function simplify(d: Disjunction): void { //Disjunction {
  const index = new KeyToFactorEntry();
  const queue = new FastPriorityQueue<FactorEntry>();

  const conjunctions = new Set<ConjunctionInfo>(
    d.conjunctions.map(createConjunctionInfo)
  );

  for (const c of conjunctions.values()) {
    addConjunction(index, queue, c);
  }

  while (true) {
    const entry = queue.poll();
    if (entry === undefined || entry.conjunctions.size < 2) {
      break;
    }
    combine(index, queue, entry);
  }
  // Index all of the all-but-one factors - use balanced tree
  // Maintain set of conjunctions
  // While at least two conjunctions share all-but-one factors
  //   Remove the entry for the factor shared amongst the most conjunctions
  //   Merge the dimension
  //   Add new item to index
}

function createConjunctionInfo(conjunction: Conjunction): ConjunctionInfo {
  const factors: FactorInfo[] = [];
  const info: ConjunctionInfo = { conjunction, factors };

  const lines = conjunction.dimensions.map(d => d.format());

  for (const [i, dimension] of conjunction.dimensions.entries()) {
    const save = lines[i];
    lines[i]='';
    const key = lines.join('\n');
    factors.push({
      key,
      dimension: dimension.dimension,
      conjunction: info
    });
    lines[i] = save;
  }

  return info;
}

function combine(
  index: KeyToFactorEntry,
  queue: FastPriorityQueue<FactorEntry>,
  entry: FactorEntry
) {
  //
  // Make new, combined conjunction
  //

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
      const message = `Did not find dimension ${dimension.id}.`;
      throw new TypeError(message);
    }
  }
  if (!firstConjunction) {
    const message = 'Factor entry has no conjunctions.';
    throw new TypeError(message);
  }

  // The prepare new list of dimensioned ranges.
  const ranges: DimensionedRange[] = [];
  for (const d of firstConjunction.dimensions) {
    if (d.dimension === entry.dimension) {
      ranges.push(combinedRange);
    } else {
      ranges.push(d);
    }
  }
  const combined = createConjunctionInfo(Conjunction.create(ranges));

  //
  // Then update the index.
  //

  // Remove conjunctions from index
  for (const c of entry.conjunctions) {
    removeConjunction(index, queue, c.conjunction);
  }

  // Add new conjunction to index
  addConjunction(index, queue, combined)
}

function addConjunction(
  index: KeyToFactorEntry,
  queue: FastPriorityQueue<FactorEntry>,
  conjunction: ConjunctionInfo
) {
  for (const f of conjunction.factors) {
    const entry = index.get(f.key);
    if (entry) {
      if (!queue.remove(entry)) {
        const message = `Entry not in priority queue`;
        throw new TypeError(message);
      }
      entry.conjunctions.add(f);
      queue.add(entry);
    } else {
      const entry: FactorEntry = {
        key: f.key,
        dimension: f.dimension,
        conjunctions: new Set<FactorInfo>([f])
      };
      index.set(f.key, entry);
      queue.add(entry);
    }
  }
}

function removeConjunction(
  index: KeyToFactorEntry,
  queue: FastPriorityQueue<FactorEntry>,
  conjunction: ConjunctionInfo
) {
  for (const f of conjunction.factors) {
    const entry = index.get(f.key);
    if (!entry) {
      const message = 'Entry not in index';
      throw new TypeError(message);
    }

    if (!queue.remove(entry)) {
      const message = `Entry not in priority queue`;
      throw new TypeError(message);
    }
    entry.conjunctions.delete(f);
    queue.add(entry);
  }
}

