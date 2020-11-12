import DRange from 'drange';

import {Dimension} from './dimension';

export class DimensionedRange {
  readonly dimension: Dimension;
  range: DRange;

  constructor(dimension: Dimension, range: DRange) {
    // TODO: move this to factory for better performance.
    const outOfDomain = range.clone().subtract(dimension.domain);
    if (outOfDomain.length > 0) {
      const message = 'Range must be a subset of domain.';
      throw new TypeError(message);
    }

    this.dimension = dimension;
    this.range = range;
  }

  isEmpty(): boolean {
    return this.range.length === 0;
  }

  isUniverse(): boolean {
    const complement = this.dimension.domain.clone().subtract(this.range);
    return complement.length === 0;
  }

  intersect(other: DimensionedRange): DimensionedRange {
    if (this.dimension !== other.dimension) {
      const message =
        'DimensionedRanges with different dimensions cannot be intersected.';
      throw new TypeError(message);
    }

    const range = this.range.clone().intersect(other.range);
    return new DimensionedRange(this.dimension, range);
  }

  union(other: DimensionedRange): DimensionedRange {
    if (this.dimension !== other.dimension) {
      const message =
        'DimensionedRanges with different dimensions cannot be unioned.';
      throw new TypeError(message);
    }

    const range = this.range.clone().add(other.range);
    return new DimensionedRange(this.dimension, range);
  }

  complement(): DimensionedRange {
    const range = this.dimension.domain.clone().subtract(this.range);
    return new DimensionedRange(this.dimension, range);
  }

  toString(): string {
    return `${this.dimension.id}: ${this.range.toString()}`;
  }

  format(): string {
    const name = this.dimension.name;
    const value = this.dimension.formatter(this.range);
    const complement = this.dimension.formatter(this.complement().range);
    if (value.length < complement.length) {
      return `${name}: ${value}`;
    } else {
      return `${name}: except ${complement}`;
    }
  }
}