import {assert} from 'chai';
import 'mocha';

import {NameShortener} from '../../../src/conversion/name_shortener';

describe('Azure Idea', () => {
  describe('NameShortener', () => {
    it('Unknown key', () => {
      const inputs = ['a', 'c/b/a', 'e/d/a'];

      const s = new NameShortener();
      for (const name of inputs) {
        s.add(name);
      }

      assert.throws(() => s.shorten('c'), 'Unknown key.');
    });

    it('Duplicate keys', () => {
      const inputs = ['a', 'c/b/a', 'e/d/a', 'a', 'c/b/a'];
      const expected = ['a', 'b/a', 'd/a', 'a', 'b/a'];

      const s = new NameShortener();
      for (const name of inputs) {
        s.add(name);
      }

      const outputs = inputs.map(x => s.shorten(x));

      assert.deepEqual(outputs, expected);
    });

    it('Basic shortening', () => {
      const inputs = ['a', 'c/b/a', 'e/d/a'];
      const expected = ['a', 'b/a', 'd/a'];

      const s = new NameShortener();
      for (const name of inputs) {
        s.add(name);
      }

      const outputs = inputs.map(x => s.shorten(x));

      assert.deepEqual(outputs, expected);
    });

    it('Constructor param', () => {
      const inputs = ['a', 'c/b/a', 'e/d/a'];
      const expected = ['a', 'b/a', 'd/a'];

      const s = new NameShortener(inputs.values());

      const outputs = inputs.map(x => s.shorten(x));

      assert.deepEqual(outputs, expected);
    });

    it('Reverse mode', () => {
      const inputs = ['a', 'c/b/a', 'e/d/a'];
      const expected = ['a', 'a/b', 'a/d'];

      const s = new NameShortener(inputs.values());
      s.reserveMode(true);

      const outputs = inputs.map(x => s.shorten(x));

      assert.deepEqual(outputs, expected);
    });
  });
});
