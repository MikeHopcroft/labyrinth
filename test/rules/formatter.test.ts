import {assert} from 'chai';
import * as ip from 'ip';
import 'mocha';

import {
  createIpFormatter,
  createNumberSymbolFormatter,
  createParser,
  DimensionType,
  formatDRange,
  parseNumberOrSymbol,
} from '../../src/dimensions';

const ipType = new DimensionType({
  name: 'ip address',
  key: 'ip',
  parser: 'ip',
  formatter: 'ip',
  domain: '0.0.0.0-255.255.255.255',
  values: [],
});
const parseIpSet = ipType.parser;

const portType = new DimensionType({
  name: 'port',
  key: 'port',
  parser: 'default',
  formatter: 'default',
  domain: '00-0xffff',
  values: [],
});

describe('Formatters', () => {
  describe('ip', () => {
    describe('createIpFormatter()', () => {
      it('CIDR block', () => {
        const formatter = createIpFormatter(new Map<string, string>());

        assert.equal(
          formatter(
            '',
            ip.toLong('1.1.1.0').toString(),
            ip.toLong('1.1.1.1').toString()
          ),
          '1.1.1.0/31'
        );
        assert.equal(
          formatter(
            '',
            ip.toLong('1.1.1.0').toString(),
            ip.toLong('1.1.1.3').toString()
          ),
          '1.1.1.0/30'
        );
        assert.equal(
          formatter(
            '',
            ip.toLong('1.1.1.0').toString(),
            ip.toLong('1.1.1.255').toString()
          ),
          '1.1.1.0/24'
        );
      });

      it('Range (not CIDR block)', () => {
        const formatter = createIpFormatter(new Map<string, string>());
        assert.equal(
          formatter(
            '',
            ip.toLong('1.1.1.0').toString(),
            ip.toLong('1.1.1.8').toString()
          ),
          '1.1.1.0-1.1.1.8'
        );
      });

      it('Single ip address', () => {
        const formatter = createIpFormatter(new Map<string, string>());
        assert.equal(
          formatter(
            ip.toLong('1.1.1.0').toString(),
            ip.toLong('1.1.1.0').toString()
          ),
          '1.1.1.0'
        );
      });
    });

    describe('formatDRange + ipFormatter', () => {
      it('No symbols', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = '0.0.0.1, 1.1.1.0/24, 2.0.0.0/30, 5.5.5.1-6.6.6.1';
        const r1 = parseIpSet(input);
        const formatter = createIpFormatter(new Map<string, string>());
        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbols for indivdual ips', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = 'abc, 1.1.1.0/24, 2.0.0.0/30, def-ghi';
        const r1 = parseIpSet(input);

        const lookup = new Map<string, string>([
          [(0x00000001).toString(), 'abc'],
          [(0x05050501).toString(), 'def'],
          [(0x06060601).toString(), 'ghi'],
          [(0x01010100).toString(), 'xyz'],
        ]);
        const formatter = createIpFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbols for ip ranges', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = '0.0.0.1, abc, 2.0.0.0/30, def';
        const r1 = parseIpSet(input);

        const lookup = new Map<string, string>([
          [(0x01010100).toString() + '-' + (0x010101ff).toString(), 'abc'],
          [(0x05050501).toString() + '-' + (0x06060601).toString(), 'def'],
        ]);
        const formatter = createIpFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbol for entire range', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = 'abc';
        const r1 = parseIpSet(input);

        const lookup = new Map<string, string>([
          [
            (0x00000001).toString() +
              ', ' +
              (0x01010100).toString() +
              '-' +
              (0x010101ff).toString() +
              ', ' +
              (0x02000000).toString() +
              '-' +
              (0x02000003).toString() +
              ', ' +
              (0x05050501).toString() +
              '-' +
              (0x06060601).toString(),
            'abc',
          ],
        ]);
        const formatter = createIpFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });
    });
  });

  describe('Number/Symbol', () => {
    describe('formatDRange + NumberSymbolFormatter', () => {
      it('No symbols', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = input;
        const r1 = createParser(portType, parseNumberOrSymbol)(input);
        const formatter = createNumberSymbolFormatter(
          new Map<string, string>()
        );
        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbols for indivdual numbers', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = 'a, b, c-d, e-f, g';
        const r1 = createParser(portType, parseNumberOrSymbol)(input);

        const lookup = new Map<string, string>([
          ['1', 'a'],
          ['3', 'b'],
          ['5', 'c'],
          ['6', 'd'],
          ['8', 'e'],
          ['9', 'f'],
          ['11', 'g'],
        ]);
        const formatter = createNumberSymbolFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbols for numeric ranges', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = '1, 3, a, b, 11';
        const r1 = createParser(portType, parseNumberOrSymbol)(input);

        const lookup = new Map<string, string>([
          ['5-6', 'a'],
          ['8-9', 'b'],
        ]);
        const formatter = createNumberSymbolFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbol for start of numeric range', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = '1, 3, a-6, 8-9, 11';
        const r1 = createParser(portType, parseNumberOrSymbol)(input);

        const lookup = new Map<string, string>([['5', 'a']]);
        const formatter = createNumberSymbolFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });

      it('Symbol for entire range', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = 'a';
        const r1 = createParser(portType, parseNumberOrSymbol)(input);

        const lookup = new Map<string, string>([['1, 3, 5-6, 8-9, 11', 'a']]);
        const formatter = createNumberSymbolFormatter(lookup);

        assert.equal(formatDRange(formatter, r1), expected);
      });
    });
  });
});
