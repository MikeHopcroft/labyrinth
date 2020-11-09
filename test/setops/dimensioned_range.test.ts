import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';
import {Dimension, DimensionedRange} from '../../src/setops';

const formatter = () => '';
const dimension1: Dimension = Dimension.create(
  'test1',
  'test1',
  formatter,
  1,
  10
);
const dimension2: Dimension = Dimension.create(
  'test2',
  'test2',
  formatter,
  5,
  15
);

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
    const dr1 = new DimensionedRange(dimension1, dimension1.domain);
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
    });

    // Case: pass throug to DRange intersect
    const dr3 = new DimensionedRange(dimension1, r2);
    const result = dr1.intersect(dr3);
    assert.equal(result.range.toString(), '[ 6-7 ]');
  });

  it('complement()', () => {
    const r1 = new DRange(5, 7);

    // Case: dimensions don't match
    const dr1 = new DimensionedRange(dimension1, r1);
    const result = dr1.complement();
    assert.equal(result.range.toString(), '[ 1-4, 8-10 ]');
  });
});
