import {combineSets} from '../utilities';

import {DimensionedRange} from './dimensioned_range';
import {Disjunction} from './disjunction';
import {FormattingOptions} from './formatting';

///////////////////////////////////////////////////////////////////////////////
//
// Represents the conjunction of a set DimensionedRanges.
//
// A Conjunction represents a set of tuples.
// TODO: write a more formal definition.
//
///////////////////////////////////////////////////////////////////////////////
export class Conjunction<A> {
  dimensions: DimensionedRange[];
  rules: Set<A>;

  static create<A>(
    dimensions: DimensionedRange[],
    rules: Set<A>
  ): Conjunction<A> {
    // Verify dimensions are in increaing order, no duplicates
    for (let i = 0; i < dimensions.length - 1; ++i) {
      if (dimensions[i].dimension.id >= dimensions[i + 1].dimension.id) {
        const message = 'Dimensions must be sorted from smallest to largest.';
        throw new TypeError(message);
      }
    }

    // Simplify conjunction.
    let simplified: DimensionedRange[] = [];
    for (const d of dimensions) {
      if (d.isEmpty()) {
        // Trim non-empty dimensions when at least one dimension is empty.
        // 0 & X = 0
        // TODO: consider using special empty dimension.
        simplified = [d];
        break;
      } else if (!d.isUniverse()) {
        // Filter out universe terms. U & X = X.
        simplified.push(d);
      }
    }

    return new Conjunction(simplified, rules);
  }

  // TODO: REVIEW: should constructor take attribution set?
  static universe<A>(): Conjunction<A> {
    return new Conjunction([], new Set<A>());
  }

  // TODO: REVIEW: what is use case for constructor other than call from Factory?
  // Can the two be combined?
  // Called directly by intersect() and overrideDimensions().
  private constructor(dimensions: DimensionedRange[], rules: Set<A>) {
    this.dimensions = dimensions;
    this.rules = rules;
  }

  isEmpty(): boolean {
    return this.dimensions.length === 1 && this.dimensions[0].isEmpty();
  }

  isUniverse(): boolean {
    return this.dimensions.length === 0;
  }

  intersect(other: Conjunction<A>): Conjunction<A> {
    const rules = combineSets([this.rules, other.rules]);
    let i1 = 0;
    let i2 = 0;
    const dimensions: DimensionedRange[] = [];
    while (i1 < this.dimensions.length && i2 < other.dimensions.length) {
      const d1 = this.dimensions[i1];
      const d2 = other.dimensions[i2];

      let d: DimensionedRange;
      if (d1.dimension.id < d2.dimension.id) {
        // Copy d1.
        d = d1;
        i1++;
      } else if (d1.dimension.id > d2.dimension.id) {
        // Copy d2.
        d = d2;
        i2++;
      } else {
        // d1 and d2 are  the same dimension, so perform the intersection.
        d = d1.intersect(d2);
        i1++;
        i2++;
      }

      if (d.isEmpty()) {
        // If any dimension is empty, return the empty set.
        return new Conjunction([d], rules);
      } else if (d.isUniverse()) {
        // Filter out universe dimensions.
        continue;
      } else {
        dimensions.push(d);
      }
    }

    // Copy over any remaining dimensions.
    while (i1 < this.dimensions.length) {
      dimensions.push(this.dimensions[i1++]);
    }
    while (i2 < other.dimensions.length) {
      dimensions.push(other.dimensions[i2++]);
    }

    return new Conjunction(dimensions, rules);
  }

  complement(): Disjunction<A> {
    if (this.isUniverse()) {
      // Complement is the empty disjunction.
      return Disjunction.create([]);
    } else if (this.isEmpty()) {
      // Complement is a disjunction with one universal conjunction.
      return Disjunction.create([new Conjunction([], this.rules)]);
    } else {
      // Apply De Morgan's Law
      const terms = this.dimensions.map(d => {
        return new Conjunction([d.complement()], this.rules);
      });
      return Disjunction.create(terms);
    }
  }

  // Create a copy of `this` Conjunction<A> where dimensions that appear
  // in `other` replace the dimensions in `this`. Used for network address
  // translation.
  overrideDimensions(override: Conjunction<A>): Conjunction<A> {
    const rules = combineSets([this.rules, override.rules]);
    let i1 = 0;
    let i2 = 0;
    const dimensions: DimensionedRange[] = [];
    while (i1 < this.dimensions.length && i2 < override.dimensions.length) {
      const d1 = this.dimensions[i1];
      const d2 = override.dimensions[i2];

      let d: DimensionedRange;
      if (d1.dimension.id < d2.dimension.id) {
        // Copy d1.
        d = d1;
        i1++;
      } else if (d1.dimension.id > d2.dimension.id) {
        // Copy d2.
        d = d2;
        i2++;
      } else {
        // Override d1 with d2.
        d = d2;
        i1++;
        i2++;
      }

      if (d.isEmpty()) {
        // If any dimension is empty, return the empty set.
        return new Conjunction([d], rules);
      } else if (d.isUniverse()) {
        // Filter out universe dimensions.
        continue;
      } else {
        dimensions.push(d);
      }
    }

    // Copy over any remaining dimensions.
    while (i1 < this.dimensions.length) {
      dimensions.push(this.dimensions[i1++]);
    }
    while (i2 < override.dimensions.length) {
      dimensions.push(override.dimensions[i2++]);
    }

    return new Conjunction(dimensions, rules);
  }

  // Create a copy of `this` Conjunction<A> where dimensions that appear
  // in `other` are filtered out. Used for undoing network address
  // translation during back propagation.
  clearOverrides(override: Conjunction<A>): Conjunction<A> {
    const rules = combineSets([this.rules, override.rules]);
    let i1 = 0;
    let i2 = 0;
    const dimensions: DimensionedRange[] = [];
    while (i1 < this.dimensions.length && i2 < override.dimensions.length) {
      const d1 = this.dimensions[i1];
      const d2 = override.dimensions[i2];

      if (d1.dimension.id < d2.dimension.id) {
        // Copy d1.
        dimensions.push(d1);
        i1++;
      } else if (d1.dimension.id > d2.dimension.id) {
        // Skip d2.
        i2++;
      } else {
        // Filter out d1.
        i1++;
        i2++;
      }
    }

    // Copy over any remaining dimensions.
    while (i1 < this.dimensions.length) {
      dimensions.push(this.dimensions[i1++]);
    }

    return new Conjunction(dimensions, rules);
  }

  format(options: FormattingOptions<A> = {}): string {
    const prefix = options.prefix || '';
    const lines = options.attribution
      ? options.attribution(this.rules, options.prefix)
      : [];
    this.dimensions.map(d => {
      lines.push(d.format(prefix));
    });
    return lines.join('\n');
  }
}
