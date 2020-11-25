import {assert} from 'chai';
import 'mocha';

import {crossProduct} from '../../src/setops';

describe('Utilities', () => {
  it('crossProduct()', () => {
    const values = [
      [1, 2],
      [3, 4, 5],
      [6, 7],
    ];

    // TODO: REVIEW: this test is brittle because it assumes an ordering
    // for the cross product.
    const expected = [
      [1, 3, 6],
      [2, 3, 6],
      [1, 4, 6],
      [2, 4, 6],
      [1, 5, 6],
      [2, 5, 6],
      [1, 3, 7],
      [2, 3, 7],
      [1, 4, 7],
      [2, 4, 7],
      [1, 5, 7],
      [2, 5, 7],
    ];

    let index = 0;
    for (const x of crossProduct(values)) {
      assert.deepEqual(x, expected[index++]);
    }
  });
});
