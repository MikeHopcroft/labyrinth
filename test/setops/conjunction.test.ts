import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';

import {Dimension, DimensionType} from '../../src/dimensions';
import {Conjunction, DimensionedRange} from '../../src/setops';

const dimension0Type = new DimensionType({
  name: 'test0',
  key: 'test0',
  parser: 'default',
  formatter: 'default',
  domain: '1-100',
  values: [],
});
const dimension0 = new Dimension('test0', 'test0', dimension0Type);

const dimension1Type = new DimensionType({
  name: 'test1',
  key: 'test1',
  parser: 'default',
  formatter: 'default',
  domain: '1-100',
  values: [],
});
const dimension1 = new Dimension('test1', 'test1', dimension1Type);

const dimension2Type = new DimensionType({
  name: 'test2',
  key: 'test2',
  parser: 'default',
  formatter: 'default',
  domain: '200-300',
  values: [],
});
const dimension2 = new Dimension('test2', 'test2', dimension2Type);

const dimension3Type = new DimensionType({
  name: 'test3',
  key: 'test3',
  parser: 'default',
  formatter: 'default',
  domain: '1000-2000',
  values: [],
});
const dimension3 = new Dimension('test3', 'test3', dimension3Type);

const dimension4Type = new DimensionType({
  name: 'test4',
  key: 'test4',
  parser: 'default',
  formatter: 'default',
  domain: '1-100',
  values: [],
});
const dimension4 = new Dimension('test4', 'test4', dimension4Type);

const range0 = new DimensionedRange(dimension0, new DRange(10, 20));

const range1 = new DimensionedRange(dimension1, new DRange(10, 20));
const range1b = new DimensionedRange(dimension1, new DRange(15, 30));

const range2 = new DimensionedRange(dimension2, new DRange(240, 260));
const range2b = new DimensionedRange(dimension2, new DRange(200, 230));

const range3 = new DimensionedRange(dimension3, new DRange(1240, 1260));
const range3b = new DimensionedRange(dimension3, new DRange(1000, 1250));

const range4 = new DimensionedRange(dimension4, new DRange(10, 20));

const emptyRange = new DimensionedRange(dimension2, new DRange());
const universeRange = new DimensionedRange(dimension2, dimension2.type.domain);
const universeRange3 = new DimensionedRange(dimension3, dimension3.type.domain);

const ignore = new Set<number>();

describe('Conjunction', () => {
  describe('create()', () => {
    // Dimension order check
    it('parameter validation', () => {
      assert.throws(() => {
        Conjunction.create([range2, range1], ignore);
      });

      assert.doesNotThrow(() => {
        Conjunction.create([range1, range2], ignore);
      });
    });

    // Trim on encountering empty dimension
    it('X & 0 = 0', () => {
      const c = Conjunction.create([range1, emptyRange, range3], ignore);
      assert.equal(c.dimensions.length, 1);
      assert.equal(c.dimensions[0], emptyRange);
    });

    // Filter out universe dimensions
    it('X & 1 = X', () => {
      const c1 = Conjunction.create([range1, universeRange, range3], ignore);
      assert.equal(c1.dimensions.length, 2);
      assert.equal(c1.dimensions[0], range1);
      assert.equal(c1.dimensions[1], range3);

      const c2 = Conjunction.create([universeRange], ignore);
      assert.equal(c2.dimensions.length, 0);
    });
  });

  describe('predicates', () => {
    // isEmpty()
    it('isEmpty()', () => {
      // Actually empty
      const c1 = Conjunction.create([range1, emptyRange, range3], ignore);
      assert.isTrue(c1.isEmpty());

      // Not empty
      const c2 = Conjunction.create([range1, range3], ignore);
      assert.isFalse(c2.isEmpty());
    });

    // isUniverse()
    it('isUniverse()', () => {
      // Actually universe
      const c1 = Conjunction.create([universeRange], ignore);
      assert.isTrue(c1.isUniverse());

      // Actually universe
      const c2 = Conjunction.create([universeRange, universeRange3], ignore);
      assert.isTrue(c2.isUniverse());

      // Not empty
      const c3 = Conjunction.create([range1, range3], ignore);
      assert.isFalse(c3.isUniverse());
    });
  });

  it('intersect()', () => {
    const c1 = Conjunction.create([range0, range1, range2, range3], ignore);
    const c2 = Conjunction.create([range1b, range2b, range3b, range4], ignore);

    // Expect empty set since range2 and range2b don't overlap.
    const r1 = c1.intersect(c2);
    assert.equal(r1.dimensions.length, 1);
    assert.equal(r1.dimensions[0].range.toString(), '[  ]');

    const c3 = Conjunction.create([range1b, range3b, range4], ignore);
    const r2 = c1.intersect(c3);
    assert.equal(r2.dimensions.length, 5);
    assert.equal(r2.dimensions[0].range.toString(), '[ 10-20 ]');
    assert.equal(r2.dimensions[1].range.toString(), '[ 15-20 ]');
    assert.equal(r2.dimensions[2].range.toString(), '[ 240-260 ]');
    assert.equal(r2.dimensions[3].range.toString(), '[ 1240-1250 ]');
    assert.equal(r2.dimensions[4].range.toString(), '[ 10-20 ]');
  });

  // complement()
  it('complement()', () => {
    const c1 = Conjunction.create([range1, range2, range3], ignore);
    const notC1 = c1.complement();

    assert.equal(notC1.conjunctions.length, 3);

    assert.equal(notC1.conjunctions[0].dimensions.length, 1);
    assert.equal(
      notC1.conjunctions[0].dimensions[0].range.toString(),
      '[ 1-9, 21-100 ]'
    );

    assert.equal(notC1.conjunctions[1].dimensions.length, 1);
    assert.equal(
      notC1.conjunctions[1].dimensions[0].range.toString(),
      '[ 200-239, 261-300 ]'
    );

    assert.equal(notC1.conjunctions[2].dimensions.length, 1);
    assert.equal(
      notC1.conjunctions[2].dimensions[0].range.toString(),
      '[ 1000-1239, 1261-2000 ]'
    );
  });
});
