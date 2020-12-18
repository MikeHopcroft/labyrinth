import DRange from 'drange';

import {Dimension} from '../dimensions';

import {setopsTelemetry} from './telemetry';

export class DimensionedRange {
  readonly dimension: Dimension;
  range: DRange;

  constructor(dimension: Dimension, range: DRange) {
    // console.log(`NEW DimensionedRange: ${dimension.name}`);
    setopsTelemetry.increment('DimensionedRange');

    // TODO: move this to factory for better performance.
    const outOfDomain = range.clone().subtract(dimension.type.domain);
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
    const complement = this.dimension.type.domain.clone().subtract(this.range);
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
    const range = this.dimension.type.domain.clone().subtract(this.range);
    return new DimensionedRange(this.dimension, range);
  }

  toString(): string {
    return `${this.dimension.id}: ${this.range.toString()}`;
  }

  format(prefix = ''): string {
    const name = this.dimension.name;
    const value = this.dimension.type.formatter(this.range);
    const complement = this.dimension.type.formatter(this.complement().range);
    if (value.length < complement.length) {
      return `${prefix}${name}: ${value}`;
    } else {
      return `${prefix}${name}: except ${complement}`;
    }
  }

  // This function is used to generate prime impicant keys for the
  // Quine-McCluskey simplification algorithm. It is faster than
  // format() because it doesn't attempt to generate and format the
  // complement and because it formats everything as numbers - there
  // are no symbol lookups or translation to IP or CIDR format.
  //
  // Might be able to improve performance by formatting numbers as
  // hex or by serializing binary values directly to a buffer.
  fastFormat(): string {
    const name = this.dimension.name;
    const value = this.range.toString().slice(2,-2);
    // Consider removing slice() for performance. Something like:
    // const value = this.range.toString();
    // Another possibility is to rewrite DRange.toString() to not
    // include the square brackets in the first place.
    return `${name}: ${value}`;
  }
}
