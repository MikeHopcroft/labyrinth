import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';

import {Dimension, DimensionType} from '../../src/dimensions';
import {DimensionedRange} from '../../src/setops';

const dimension1Type = new DimensionType({
  name: 'test1',
  key: 'test1',
  parser: 'default',
  formatter: 'default',
  domain: '1-10',
  values: []
});
const dimension1 = new Dimension('test1', 'test1', dimension1Type);

const dimension2Type = new DimensionType({
  name: 'test2',
  key: 'test2',
  parser: 'default',
  formatter: 'default',
  domain: '5-15',
  values: []
});
const dimension2 = new Dimension('test2', 'test2', dimension2Type);

describe('DimensionedRange', () => {
  it('constructor validates range', () => {
    assert.throws(() => {
      new DimensionedRange(dimension1, new DRange(100, 200));
    });
    assert.doesNotThrow(() => {
      new DimensionedRange(dimension1, new DRange(5, 6));
    });
  });

  it('isEmpty()', () => {
    // Case: empty set
    const dr1 = new DimensionedRange(dimension1, new DRange());
    assert.isTrue(dr1.isEmpty());

    // Case: not empty set
    const dr2 = new DimensionedRange(dimension1, new DRange(10));
    assert.isFalse(dr2.isEmpty());
  });

  it('isUniverse()', () => {
    // Case: universe
    const dr1 = new DimensionedRange(dimension1, dimension1.type.domain);
    assert.isTrue(dr1.isUniverse());

    // Case: not universe
    const dr2 = new DimensionedRange(dimension1, new DRange(10));
    assert.isFalse(dr2.isUniverse());
  });

  it('intersect()', () => {
    const r1 = new DRange(5, 7);
    const r2 = new DRange(6, 10);

    // Case: dimensions don't match
    const dr1 = new DimensionedRange(dimension1, r1);
    const dr2 = new DimensionedRange(dimension2, r2);
    assert.throws(() => {
      dr1.intersect(dr2);
    }, 'DimensionedRanges with different dimensions cannot be intersected.');

    // Case: pass through to DRange intersect
    const dr3 = new DimensionedRange(dimension1, r2);
    const result = dr1.intersect(dr3);
    assert.equal(result.range.toString(), '[ 6-7 ]');
  });

  it('union()', () => {
    const r1 = new DRange(5, 7);
    const r2 = new DRange(6, 10);

    // Case: dimensions don't match
    const dr1 = new DimensionedRange(dimension1, r1);
    const dr2 = new DimensionedRange(dimension2, r2);
    assert.throws(() => {
      dr1.union(dr2);
    }, 'DimensionedRanges with different dimensions cannot be unioned.');

    // Case: pass through to DRange union
    const dr3 = new DimensionedRange(dimension1, r2);
    const result = dr1.union(dr3);
    assert.equal(result.range.toString(), '[ 5-10 ]');
  });

  it('complement()', () => {
    const r1 = new DRange(5, 7);

    // Case: dimensions don't match
    const dr1 = new DimensionedRange(dimension1, r1);
    const result = dr1.complement();
    assert.equal(result.range.toString(), '[ 1-4, 8-10 ]');
  });
});
