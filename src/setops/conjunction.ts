import { DimensionedRange } from './dimensioned_range';
import { Disjunction } from './disjunction';
import { Dimension } from './dimension';

export class Conjunction {
  dimensions: DimensionedRange[];

  static create(dimensions: DimensionedRange[]) {
    // Verify dimensions are in increaing order, no duplicates
    for (let i = 0; i < dimensions.length - 1; ++i) {
      if (dimensions[i].dimension.id >= dimensions[i+1].dimension.id) {
        const message = "Dimensions must be sorted from smallest to largest.";
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

    return new Conjunction(simplified);
  }

  private constructor(dimensions: DimensionedRange[]) {
    this.dimensions = dimensions;
  }

  isEmpty(): boolean {
    return this.dimensions.length === 1 && this.dimensions[0].isEmpty(); 
  }

  isUniverse(): boolean {
    return this.dimensions.length === 0;
  }

  intersect(other: Conjunction): Conjunction {
    let i1 = 0;
    let i2 = 0;
    let dimensions: DimensionedRange[] = [];
    while (i1 < this.dimensions.length && i2 < other.dimensions.length) {
      const d1 = this.dimensions[i1];
      const d2 = other.dimensions[i2];

      let d: DimensionedRange;
      if (d1.dimension.id < d2.dimension.id) {
        // Copy d1.
        // console.log(`Copy left ${d1.toString()}`);
        d = d1;
        i1++;
      } else if (d1.dimension.id > d2.dimension.id) {
        // Copy d2.
        // console.log(`Copy right ${d2.toString()}`);
        d = d2;
        i2++;
      } else {
        // d1 and d2 are  the same dimension, so perform the intersection.
        // console.log(`Intersect ${d1.toString()} with ${d2.toString()}`);
        d = d1.intersect(d2);
        // console.log(`  => ${d.toString()}`);
        i1++;
        i2++;
      }

      if (d.isEmpty()) {
        // If any dimension is empty, trim all of the other dimensions and
        // exit loop.
        return new Conjunction([d]);
        // dimensions = [d];
        // break;
      } else if (d.isUniverse()) {
        // Filter out universe dimensions.
        continue;
      } else {
        dimensions.push(d);
      }
    }

    // if (dimensions.length !== 1 || !dimensions[0].isEmpty()) {
      while (i1 < this.dimensions.length) {
        dimensions.push(this.dimensions[i1++]);
      }

      while (i2 < other.dimensions.length) {
        dimensions.push(other.dimensions[i2++]);
      }
    // }

    return new Conjunction(dimensions);
  }

  complement(): Disjunction {
    if (this.isUniverse()) {
      // Complement is the empty disjunction.
      return Disjunction.create([]);
    } else if (this.isEmpty()) {
      // Complement is a disjunction with one universal conjunction.
      return Disjunction.create([new Conjunction([])]);
    } else {
      // Apply De Morgan's Law
      const terms = this.dimensions.map((d) => {
        return new Conjunction([d.complement()]);
      });
      return Disjunction.create(terms);
    }
  }

  numbers(dimension: Dimension): number[] {
    for (const factor of this.dimensions) {
      if (factor.dimension === dimension) {
        return factor.range.numbers();
      }
    }
    return dimension.domain.numbers();
  }

  toString(): string {
    return this.dimensions.map(d => {return d.toString()}).join('\n') + '\n';
  }
}
