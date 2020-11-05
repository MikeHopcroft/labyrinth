import {Conjunction} from './conjunction';

export class Disjunction {
  conjunctions: Conjunction[];

  static create(conjunctions: Conjunction[]) {
    // Simplify conjunction.
    let simplified: Conjunction[] = [];
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

  private constructor(conjunctions: Conjunction[]) {
    this.conjunctions = conjunctions;
  }

  isEmpty(): boolean {
    return this.conjunctions.length === 0;
  }

  isUniverse(): boolean {
    return this.conjunctions.length === 1 && this.conjunctions[0].isUniverse();
  }

  intersect(other: Disjunction): Disjunction {
    const terms: Conjunction[] = [];
    for (const t1 of this.conjunctions) {
      for (const t2 of other.conjunctions) {
        terms.push(t1.intersect(t2));
      }
    }

    // TODO: consider simplification strategies here.
    // TODO: consider standalone simplifaction routine.

    return new Disjunction(terms);
  }
}
