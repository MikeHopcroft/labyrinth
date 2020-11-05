import { assert } from 'chai';
import DRange from 'drange';
import 'mocha';

import {
  Conjunction,
  Dimension,
  DimensionedRange,
  Disjunction
} from '../../src/setops';

const dimension1: Dimension = Dimension.create(1, 100);
// const dimension2: Dimension = Dimension.create(200, 300);
// const dimension3: Dimension = Dimension.create(1000, 2000);

const range1 = new DimensionedRange(dimension1, new DRange(10, 20));
const universeRange1 = new DimensionedRange(dimension1, dimension1.domain);
const emptyRange1 = new DimensionedRange(dimension1, new DRange());
// const range2 = new DimensionedRange(dimension2, new DRange(240, 260));
// const range3 = new DimensionedRange(dimension3, new DRange(1240, 1260));
// const universeRange3 = new DimensionedRange(dimension3, dimension3.domain);


describe('Disjunction', () => {
  it('isEmpty()', () => {
    // Actually empty
    const d1 = Disjunction.create([]);
    assert.isTrue(d1.isEmpty());

    // Not empty
    const c1 = Conjunction.create([range1]);
    const d2 = Disjunction.create([c1]);
    assert.isFalse(d2.isEmpty());
  });

  it('isUniverse()', () => {
    // Actually universe
    const u = Conjunction.create([universeRange1]);
    const d1 = Disjunction.create([u]);
    assert.isTrue(d1.isUniverse());

    // Actually universe
    const c1 = Conjunction.create([range1]);
    const d2 = Disjunction.create([c1]);
    assert.isFalse(d2.isUniverse());
  });

  // Set A:
  //   x: 1-2
  //   y: 1-2
  //
  //   or
  //
  //   x: 1-2
  //   y: 4-5
  //
  // x x x x x 
  // x 1 1 x x 
  // x 1 1 x x 
  // x x x x x 
  // x 2 2 x x 
  // x 2 2 x x 
  // x x x x x 
  //
  //
  // Set B:
  //   x: 2
  //   y: 0-6
  //
  //   or
  //
  //   x: 0-4
  //   y: 5
  //
  // x x 3 x x 
  // x x 3 x x 
  // x x 3 x x 
  // x x 3 x x 
  // x x 3 x x 
  // 4 4 3 4 4 
  // x x 3 x x 
  //
  // Set S = A & B:
  //
  // x x x x x 
  // x x S x x 
  // x x S x x 
  // x x x x x 
  // x x S x x 
  // x S S x x 
  // x x x x x 
  //

  it('intersect(): X & Y', () => {
    assert.isTrue(false);
  });

  it('intersect(): X & 0', () => {
    assert.isTrue(false);
  });

  it('intersect(): X & 1', () => {
    assert.isTrue(false);
  });

  it('X + 1 = 1', () => {
    const c = Conjunction.create([range1]);
    const u = Conjunction.create([universeRange1]);

    const d1 = Disjunction.create([u, c]);
    assert.equal(d1.conjunctions.length, 1);
    assert.isTrue(d1.isUniverse());

    const d2 = Disjunction.create([c, u]);
    assert.equal(d2.conjunctions.length, 1);
    assert.isTrue(d2.isUniverse());
  });

  it('X + 0 = X', () => {
    const c = Conjunction.create([range1]);
    const e = Conjunction.create([emptyRange1]);

    const d1 = Disjunction.create([e, c]);
    assert.equal(d1.conjunctions.length, 1);
    assert.equal(d1.conjunctions[0], c);

    const d2 = Disjunction.create([c, e]);
    assert.equal(d2.conjunctions.length, 1);
    assert.equal(d2.conjunctions[0], c);
  });
});
