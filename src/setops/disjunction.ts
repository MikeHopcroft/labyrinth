import {nopSimplifier} from './create_simplifier';
import {Conjunction} from './conjunction';
import {FormattingOptions} from './formatting';
import {Simplifier} from './simplifier';

///////////////////////////////////////////////////////////////////////////////
//
// Represents the disjunction or union of a collection of Conjunctions.
//
// A Disjunction is the normal form for a set theoretic representation of a
// set of tuples.
// TODO: write a more formal definition.
//
///////////////////////////////////////////////////////////////////////////////
export class Disjunction<A> {
  conjunctions: Conjunction<A>[];

  static create<A>(conjunctions: Conjunction<A>[]): Disjunction<A> {
    // Simplify conjunction.
    let simplified: Conjunction<A>[] = [];
    for (const c of conjunctions) {
      if (c.isUniverse()) {
        // X | 1 = 1
        simplified = [c];
        break;
      } else if (!c.isEmpty()) {
        // X | 0 = X
        simplified.push(c);
      }
    }

    return new Disjunction(simplified);
  }

  static emptySet<A>(): Disjunction<A> {
    return new Disjunction<A>([]);
  }

  static universe<A>(): Disjunction<A> {
    return new Disjunction<A>([Conjunction.universe()]);
  }

  private constructor(conjunctions: Conjunction<A>[]) {
    this.conjunctions = conjunctions;
  }

  isEmpty(): boolean {
    return this.conjunctions.length === 0;
  }

  isUniverse(): boolean {
    return this.conjunctions.length === 1 && this.conjunctions[0].isUniverse();
  }

  intersect(
    other: Disjunction<A>,
    simplifier: Simplifier<A> = nopSimplifier
  ): Disjunction<A> {
    let terms: Conjunction<A>[] = [];
    for (const t1 of this.conjunctions) {
      for (const t2 of other.conjunctions) {
        const t = t1.intersect(t2);
        if (t.isUniverse()) {
          terms = [t];
          break;
        }

        if (!t.isEmpty()) {
          terms.push(t1.intersect(t2));
        }
      }
    }

    // TODO: consider simplification strategies here.
    // TODO: consider standalone simplifaction routine.

    return simplifier(new Disjunction(terms));
  }

  union(
    other: Disjunction<A>,
    simplifier: Simplifier<A> = nopSimplifier
  ): Disjunction<A> {
    let terms = [...this.conjunctions];
    for (const t of other.conjunctions) {
      if (t.isEmpty()) {
        // X + 0 = X
        continue;
      }

      if (t.isUniverse()) {
        // X + 1 = 1
        terms = [t];
        break;
      }

      terms.push(t);

      // TODO: consider other simplification strategies here.
      //   Remove duplicates
    }

    return simplifier(new Disjunction(terms));
  }

  // Create a copy of `this` Disjunction<A> where dimensions that appear
  // in `other` replace the dimensions in `this`. Used for network address
  // translation.
  overrideDimensions(override: Conjunction<A>): Disjunction<A> {
    const terms = this.conjunctions.map(term =>
      term.overrideDimensions(override)
    );
    return new Disjunction(terms);
  }

  // Create a copy of `this` Disjunction<A> where dimensions that appear
  // in `other` are filtered out. Used for undoing network address
  // translation during back propagation.
  clearOverrides(override: Conjunction<A>): Disjunction<A> {
    const terms = this.conjunctions.map(term => term.clearOverrides(override));
    return new Disjunction(terms);
  }

  equivalent(
    other: Disjunction<A>,
    simplifier: Simplifier<A> = nopSimplifier
  ): boolean {
    // For performance, subtract smaller expression from larger expression.
    // If this first subtract operation returns non-empty, we can return
    // false without performing the other, more expensive subtraction.
    const [a, b] =
      this.conjunctions.length > other.conjunctions.length
        ? [this, other]
        : [other, this];

    const aSubB = a.subtract(b, simplifier);
    if (!aSubB.isEmpty) {
      return false;
    }

    const bSubA = b.subtract(a, simplifier);
    return bSubA.isEmpty();
  }

  subtract(
    other: Disjunction<A>,
    simplifier: Simplifier<A> = nopSimplifier
  ): Disjunction<A> {
    const factors = other.conjunctions.map(x => x.complement());

    return factors.reduce(
      (acc, cur) => (acc.isEmpty() ? acc : simplifier(acc.intersect(cur))),
      this
    );
  }

  format(options: FormattingOptions<A> = {}): string {
    if (this.isUniverse()) {
      const prefix = options.prefix || '';
      return `${prefix}(universe)`;
    }
    const lines = this.conjunctions.map(c => c.format(options));
    return lines.join('\n\n');
  }
}
