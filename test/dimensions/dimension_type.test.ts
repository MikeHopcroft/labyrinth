import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';

import {DimensionType} from '../../src/dimensions';

describe('DimensionType', () => {
  describe('invalid', () => {
    it('Key is not legal Javascript identifer.', () => {
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'illegal-identifier',
            parser: 'ip',
            formatter: 'ip',
            domain: '0.0.0.0-255.255.255.255',
            values: [],
          }),
        'Dimension "ip address": illegal Javascript identifier "illegal-identifier".'
      );
    });

    it('Key is reserved word.', () => {
      assert.throws(
        () =>
          new DimensionType(
            {
              name: 'ip address',
              key: 'reserved',
              parser: 'ip',
              formatter: 'ip',
              domain: '0.0.0.0-255.255.255.255',
              values: [],
            },
            new Set<string>(['reserved'])
          ),
        'Dimension "ip address": reserved keyword "reserved".'
      );
    });

    it('Symbol is not legal Javascript identifer.', () => {
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'ip',
            parser: 'ip',
            formatter: 'ip',
            domain: '0.0.0.0-255.255.255.255',
            values: [
              {
                symbol: 'illegal-identifier',
                range: '1.1.1.1',
              },
            ],
          }),
        'Dimension "ip address": illegal symbol "illegal-identifier".'
      );
    });

    it('Symbol is reserved word.', () => {
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'ip',
            parser: 'ip',
            formatter: 'ip',
            domain: '0.0.0.0-255.255.255.255',
            values: [
              {
                symbol: 'all',
                range: '1.1.1.1',
              },
            ],
          }),
        'Dimension "ip address": illegal symbol "all".'
      );
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'ip',
            parser: 'ip',
            formatter: 'ip',
            domain: '0.0.0.0-255.255.255.255',
            values: [
              {
                symbol: '*',
                range: '1.1.1.1',
              },
            ],
          }),
        'Dimension "ip address": illegal symbol "*".'
      );
    });

    it('Cycle in definition chain.', () => {
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'ip',
            parser: 'ip',
            formatter: 'ip',
            domain: '0.0.0.0-255.255.255.255',
            values: [
              {
                symbol: 'a',
                range: 'b',
              },
              {
                symbol: 'b',
                range: 'c',
              },
              {
                symbol: 'c',
                range: 'a',
              },
            ],
          }),
        'Dimension "ip address": cyclic definition for "a".'
      );
    });

    it('Unknown parser.', () => {
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'ip',
            parser: 'unknownParser',
            formatter: 'ip',
            domain: '0.0.0.0-255.255.255.255',
            values: [],
          }),
        'Dimension "ip address": unknown parser "unknownParser".'
      );
    });

    it('Unknown formatter.', () => {
      assert.throws(
        () =>
          new DimensionType({
            name: 'ip address',
            key: 'ip',
            parser: 'ip',
            formatter: 'unknownFormatter',
            domain: '0.0.0.0-255.255.255.255',
            values: [],
          }),
        'Dimension "ip address": unknown formatter "unknownFormatter".'
      );
    });
  });

  describe('lookup()', () => {
    it('Unknown symbol', () => {
      const d = new DimensionType({
        name: 'ip address',
        key: 'ip',
        parser: 'ip',
        formatter: 'ip',
        domain: '0.0.0.0-255.255.255.255',
        values: [
          {
            symbol: 'a',
            range: '1.1.1.1',
          },
        ],
      });
      assert.throws(
        () => d.lookup('b'),
        'Dimension "ip address": unknown ip address "b".'
      );
    });

    it('Simple definition', () => {
      const d = new DimensionType({
        name: 'ip address',
        key: 'ip',
        parser: 'ip',
        formatter: 'ip',
        domain: '0.0.0.0-255.255.255.255',
        values: [
          {
            symbol: 'a',
            range: '1.1.1.1',
          },
        ],
      });
      assert.deepEqual(d.lookup('a'), new DRange(0x01010101));
    });

    it('Definition chain', () => {
      const d = new DimensionType({
        name: 'ip address',
        key: 'ip',
        parser: 'ip',
        formatter: 'ip',
        domain: '0.0.0.0-255.255.255.255',
        values: [
          {
            symbol: 'a',
            range: 'b',
          },
          {
            symbol: 'c',
            range: '1.1.1.1',
          },
          {
            symbol: 'b',
            range: 'c',
          },
        ],
      });
      assert.deepEqual(d.lookup('a'), new DRange(0x01010101));
    });

    it('Complex chain', () => {
      const d = new DimensionType({
        name: 'ip address',
        key: 'ip',
        parser: 'ip',
        formatter: 'ip',
        domain: '0.0.0.0-255.255.255.255',
        values: [
          {
            symbol: 'a',
            range: 'b',
          },
          {
            symbol: 'c',
            range: '1.1.1.1',
          },
          {
            symbol: 'b',
            range: 'c-d, e',
          },
          {
            symbol: 'd',
            range: '1.1.1.2',
          },
          {
            symbol: 'e',
            range: '2.2.2.2',
          },
        ],
      });
      const expected = new DRange(0x01010101, 0x01010102).add(0x02020202);
      const observed = d.lookup('a');
      assert.deepEqual(observed, expected);
    });
  });
});
