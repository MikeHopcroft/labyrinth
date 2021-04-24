import {Dimension} from '../dimensions';
import {Conjunction} from './conjunction';
import {DimensionedRange} from './dimensioned_range';
import {Disjunction} from './disjunction';

// A Term is a simpler representation of a Conjunction that uses numeric
// identifiers to represent sets of values on each dimension. The Term
// exists, mainly as a performance optimization dimension equality checks
// in the contains() function, below. The Term.values array also acts as
// a cache for representations of a serialized dimension values, which
// would otherwise need to be regnerated for each comparison.
//
interface Term<A> {
  // Conjunction this Term represents. Used to convert Term back to
  // a Conjunction.
  conjunction: Conjunction<A>;

  // Number of unconstrained dimensions for this term.
  unconstrained: number;

  // Numeric identifiers for value of set on each dimension.
  // NOTE: special sentinal value of 0 denotes an unconstrained dimension.
  values: number[];

  // A string representation of `values`, suitable for fast equality
  // checks.
  key: string;
}

///////////////////////////////////////////////////////////////////////////////
//
// coalesce() removes terms from a Disjunction that are subsets or duplicates
// of other terms in the Disjunction. The resulting Disjunction represents the
// same set as the original Disjunction, but has fewer terms.
//
///////////////////////////////////////////////////////////////////////////////
export function coalesce<A>(
  dimensions: Dimension[],
  d: Disjunction<A>
): Disjunction<A> {
  // Array of terms that still need to be checked to see if they contain other
  // terms. This array is maintained in order of decreasing number of
  // unconstrained dimensions.
  let check: Term<A>[] = [];

  // Array of terms that have been proven to be in the coalesced Conjunction.
  const keep: Term<A>[] = [];

  // Table used to assign numeric identifiers to sets of values on a dimension.
  // The set is represented by its string serialization.
  const hashTable = new Map<string, number>();

  // The set of unique keys across all Terms. Used to dedupe Terms.
  const keys = new Set<string>();

  for (const c of d.conjunctions) {
    // Convert each Conjunction<A> to a Term.
    const t = createTerm(c, dimensions, hashTable);

    // Dedupe and add to list of Terms to check.
    if (!keys.has(t.key)) {
      keys.add(t.key);
      check.push(t);
    }
  }

  // We will process partially constrained terms starting at the least
  // constrained (i.e. term with most unconstrained dimensions). This ordering
  // allows us to move the least constrained term to the keep list on each
  // iteration. We can do this because
  //   1. The ...tail of check[] cannot have a superset Term (because the rest
  //      of the terms are at least as constrained).
  //   2. The ...tail of check[] cannot contain a duplicate Term (because
  //      duplicates were removed as check[] was filled.
  check.sort((a, b) => b.unconstrained - a.unconstrained);

  // Quadratic algorithm to check if each term contains one of the others.
  // On each iteration, we split the list into [head, ...tail] and then
  // filter from tail those items that are a subset of head.
  while (check.length > 1 && check[0].unconstrained > 0) {
    // We can always keep the head, for reasons described above.
    const head = check[0];
    keep.push(head);

    // Filter check[] into copy[], removing terms that are subsets of `head`.
    const copy: Term<A>[] = [];
    for (let i = 1; i < check.length; ++i) {
      if (contains(head, check[i])) {
        // partial[i] is redundant because it is a subset of `head`.
        // Therefore, don't copy.
        continue;
      }
      copy.push(check[i]);
    }
    check = copy;
  }

  // Convert the Terms in `keep` to a Disjunction and return.
  const conjunctions = keep.map(x => x.conjunction);
  for (const x of check) {
    conjunctions.push(x.conjunction);
  }

  return Disjunction.create<A>(conjunctions);
}

// Returns true if Term `a` is a superset of or equal to Term `b`.
function contains<A>(a: Term<A>, b: Term<A>): boolean {
  for (const [i, av] of a.values.entries()) {
    if (av !== 0 && av !== b.values[i]) {
      return false;
    }
  }
  return true;
}

function createTerm<A>(
  conjunction: Conjunction<A>,
  dimensions: Dimension[],
  hashTable: Map<string, number>
): Term<A> {
  let i = 0;
  let unconstrained = 0;
  const values: number[] = [];
  for (const d of dimensions) {
    // DESIGN NOTE: this function assumes that the Conjunction is in a normal
    // form, where all unconstrained dimensions have been filtered out.
    // WARNING: we don't explicitly verify the normal form here.
    if (
      i < conjunction.dimensions.length &&
      conjunction.dimensions[i].dimension.id === d.id
    ) {
      values.push(getHash(conjunction.dimensions[i++], hashTable));
    } else {
      // Zero is a special, sentinel value denoting an unconstrained dimension
      // (i.e. the set of all values on a dimension)
      values.push(0);
      unconstrained++;
    }
  }

  return {
    conjunction,
    unconstrained: unconstrained,
    values,
    key: values.join(','),
  };
}

function getHash(d: DimensionedRange, hashTable: Map<string, number>): number {
  const value = d.range.toString();
  let hash = hashTable.get(value);
  if (hash === undefined) {
    // Hashes start at 1, because 0 is reserved for unconstrained dimensions.
    hash = hashTable.size + 1;
    hashTable.set(value, hash);
  }
  return hash;
}
