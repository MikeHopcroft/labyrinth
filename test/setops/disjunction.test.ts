import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';

import {Dimension, DimensionType} from '../../src/dimensions';

import {
  Conjunction,
  DimensionedRange,
  Disjunction,
  disjunctionValues,
} from '../../src/setops';

const dimension1Type = new DimensionType({
  name: 'test1',
  key: 'test1',
  parser: 'default',
  formatter: 'default',
  domain: '1-100',
  values: [],
});
const dimension1 = new Dimension('test1', 'test1', dimension1Type);

const dimensionXType = new DimensionType({
  name: 'x',
  key: 'x',
  parser: 'default',
  formatter: 'default',
  domain: '0-4',
  values: [],
});
const dimensionX = new Dimension('x', 'x', dimensionXType);

const dimensionYType = new DimensionType({
  name: 'y',
  key: 'y',
  parser: 'default',
  formatter: 'default',
  domain: '0-6',
  values: [],
});
const dimensionY = new Dimension('y', 'y', dimensionYType);

const range1 = new DimensionedRange(dimension1, new DRange(10, 20));
const universeRange1 = new DimensionedRange(dimension1, dimension1.type.domain);
const emptyRange1 = new DimensionedRange(dimension1, new DRange());

describe('Disjunction', () => {
  describe('create()', () => {
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

  describe('intersect()', () => {
    it('intersect(): X & Y', () => {
      const x = dimensionX;
      const y = dimensionY;

      // Set A:
      //   . . . . .
      //   . a a . .
      //   . a a . .
      //   . . . . .
      //   . a a . .
      //   . a a . .
      //   . . . . .
      const a = Disjunction.create([
        Conjunction.create([
          new DimensionedRange(x, new DRange(1, 2)),
          new DimensionedRange(y, new DRange(1, 2)),
        ]),
        Conjunction.create([
          new DimensionedRange(x, new DRange(1, 2)),
          new DimensionedRange(y, new DRange(4, 5)),
        ]),
      ]);

      // Set B:
      //   . . b . .
      //   . . b . .
      //   . . b . .
      //   . . b . .
      //   . . b . .
      //   b b b b b
      //   . . b . .
      const b = Disjunction.create([
        Conjunction.create([
          new DimensionedRange(x, new DRange(2)),
          new DimensionedRange(y, new DRange(0, 6)),
        ]),
        Conjunction.create([
          new DimensionedRange(x, new DRange(0, 4)),
          new DimensionedRange(y, new DRange(5)),
        ]),
      ]);

      // Set C = A & B:
      //   . . . . .
      //   . . c . .
      //   . . c . .
      //   . . . . .
      //   . . c . .
      //   . c c . .
      //   . . . . .
      const c = a.intersect(b);
      const values = [...disjunctionValues([x, y], c).values()];
      assert.deepEqual(values, ['[2,1]', '[2,2]', '[2,4]', '[2,5]', '[1,5]']);
    });

    it('intersect(): X & 0', () => {
      const x = dimensionX;
      const y = dimensionY;

      const a = Disjunction.create([
        Conjunction.create([
          new DimensionedRange(x, new DRange(1, 2)),
          new DimensionedRange(y, new DRange(1, 2)),
        ]),
        Conjunction.create([
          new DimensionedRange(x, new DRange(1, 2)),
          new DimensionedRange(y, new DRange(4, 5)),
        ]),
      ]);

      const b = Disjunction.create([]);

      const c = a.intersect(b);
      const values = [...disjunctionValues([x, y], c).values()];
      assert.deepEqual(values, []);
    });

    it('intersect(): X & 1', () => {
      const x = dimensionX;
      const y = dimensionY;

      const a = Disjunction.create([
        Conjunction.create([
          new DimensionedRange(x, new DRange(1, 2)),
          new DimensionedRange(y, new DRange(1, 2)),
        ]),
        Conjunction.create([
          new DimensionedRange(x, new DRange(1, 2)),
          new DimensionedRange(y, new DRange(4, 5)),
        ]),
      ]);

      const b = Disjunction.create([Conjunction.create([])]);

      const c = a.intersect(b);
      const values = [...disjunctionValues([x, y], c).values()];
      assert.deepEqual(values, [
        '[1,1]',
        '[2,1]',
        '[1,2]',
        '[2,2]',
        '[1,4]',
        '[2,4]',
        '[1,5]',
        '[2,5]',
      ]);
    });
  });

  describe('predicates', () => {
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
  });
});
