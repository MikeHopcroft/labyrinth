import { assert } from 'chai';
import * as ip from 'ip';
import 'mocha';

import {
  createFormatter,
  createGenericFormatter,
  createIpFormatter,
  createParser,
  emptyLookup,
  // formatIpRange,
  // formatProtocol,
  generalFormatter,
  // ipFormatter,
  parseNumberOrSymbol,
  parseIpSet,
  // parsePortSet,
  // parseProtocolSet,
  // portFormatter,
  // protocolFormatter,
} from '../../src/rules';

import { Dimension } from '../../src/setops';

const formatter = () => '';
const ips = Dimension.create(
  'source ip',
  'ip address',
  formatter,
  0,
  4294967295
);
const ports = Dimension.create('source port', 'port', formatter, 0, 65535);
const protocols = Dimension.create('protcol', 'protocol', formatter, 0, 255);

describe('Formatters', () => {
  describe('ip', () => {
    describe('createIpFormatter()', () => {
      it('CIDR block', () => {
        const formatter = createIpFormatter(new Map<string, string>());

        assert.equal(
          formatter('', ip.toLong('1.1.1.0').toString(), ip.toLong('1.1.1.1').toString()),
          // formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.1')),
          '1.1.1.0/31'
        );
        assert.equal(
          formatter('', ip.toLong('1.1.1.0').toString(), ip.toLong('1.1.1.3').toString()),
          // formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.3')),
          '1.1.1.0/30'
        );
        assert.equal(
          formatter('', ip.toLong('1.1.1.0').toString(), ip.toLong('1.1.1.255').toString()),
          // formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.255')),
          '1.1.1.0/24'
        );
      });

      it('Range (not CIDR block)', () => {
        const formatter = createIpFormatter(new Map<string, string>());
        assert.equal(
          formatter('', ip.toLong('1.1.1.0').toString(), ip.toLong('1.1.1.8').toString()),
          // formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.8')),
          '1.1.1.0-1.1.1.8'
        );
      });

      it('Single ip address', () => {
        const formatter = createIpFormatter(new Map<string, string>());
        assert.equal(
          formatter(ip.toLong('1.1.1.0').toString(), ip.toLong('1.1.1.0').toString()),
          // formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.0')),
          '1.1.1.0'
        );
      });
    });

    // describe('ipFormatter', () => {
    //   it('General', () => {
    //     const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
    //     const expected = '1, 1.1.1.0/24, 2.0.0.0/30, 5.5.5.1-6.6.6.1';
    //     const r1 = parseIpSet(ips, input);
    //     assert.equal(ipFormatter(r1.dimensions[0].range), expected);
    //   });
    // });

    describe('generalFormatter', () => {
      it('No symbols', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = '0.0.0.1, 1.1.1.0/24, 2.0.0.0/30, 5.5.5.1-6.6.6.1';
        const r1 = parseIpSet(ips, input);
        const formatter = createIpFormatter(new Map<string, string>());
        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });

      it('Symbols for indivdual ips', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = 'abc, 1.1.1.0/24, 2.0.0.0/30, def-ghi';
        const r1 = parseIpSet(ips, input);

        const lookup = new Map<string, string>([
          [ 0x00000001.toString(), 'abc' ],
          [ 0x05050501.toString(), 'def' ],
          [ 0x06060601.toString(), 'ghi' ],
          [ 0x01010100.toString(), 'xyz']
        ]);
        const formatter = createIpFormatter(lookup);

        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });

      it('Symbol for ip range', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = '0.0.0.1, abc, 2.0.0.0/30, def';
        const r1 = parseIpSet(ips, input);

        const lookup = new Map<string, string>([
          [ 0x01010100.toString() + '-' + 0x010101ff.toString(), 'abc' ],
          [ 0x05050501.toString() + '-' + 0x06060601.toString(), 'def' ],
        ]);
        const formatter = createIpFormatter(lookup);

        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });

      it('Symbol for entire range', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = 'abc';
        const r1 = parseIpSet(ips, input);

        const lookup = new Map<string, string>([
          [
            0x00000001.toString() + ', ' +
            0x01010100.toString() + '-' + 0x010101ff.toString() + ', ' +
            0x02000000.toString() + '-' + 0x02000003.toString() + ', ' +
            0x05050501.toString() + '-' + 0x06060601.toString(),
            'abc'
          ]
        ]);
        const formatter = createIpFormatter(lookup);

        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });
    });
  });

  describe('genericFormatter', () => {
    describe('generalFormatter', () => {
      it('No symbols', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = input;
        const r1 = createParser(parseNumberOrSymbol, emptyLookup)(ports, input);
        const formatter = createGenericFormatter(new Map<string, string>());
        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });

      it('Symbol for indivdual number', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = 'a, b, c-d, e-f, g';
        const r1 = createParser(parseNumberOrSymbol, emptyLookup)(ports, input);

        const lookup = new Map<string, string>([
          ['1', 'a'],
          ['3', 'b'],
          ['5', 'c'],
          ['6', 'd'],
          ['8', 'e'],
          ['9', 'f'],
          ['11', 'g'],
        ]);
        const formatter = createGenericFormatter(lookup);

        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });

      it('Symbol for numeric range', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = '1, 3, a, b, 11';
        const r1 = createParser(parseNumberOrSymbol, emptyLookup)(ports, input);

        const lookup = new Map<string, string>([
          ['5-6', 'a'],
          ['8-9', 'b'],
        ]);
        const formatter = createGenericFormatter(lookup);

        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });

      it('Symbol for entire range', () => {
        const input = '1, 3, 5-6, 8-9, 11';
        const expected = 'a';
        const r1 = createParser(parseNumberOrSymbol, emptyLookup)(ports, input);

        const lookup = new Map<string, string>([
          ['1, 3, 5-6, 8-9, 11', 'a'],
        ]);
        const formatter = createGenericFormatter(lookup);

        assert.equal(generalFormatter(formatter, r1.dimensions[0].range), expected);
      });
    });
  });

  // describe('port', () => {
  //   it('portFormatter', () => {
  //     const input = '1, 6, 17, 30-40, 50, 60-70';
  //     const expected = '1, 6, 17, 30-40, 50, 60-70';
  //     const r1 = parsePortSet(ports, input);

  //     const portFormatter = createFormatter(
  //       createGenericFormatter(new Map<string, string>([['60-70', 'x']]))
  //     );

  //     assert.equal(portFormatter(r1.dimensions[0].range), expected);
  //   });
  // });

  // describe('protocol', () => {
  //   describe('formatProtocol()', () => {
  //     // it('TCP', () => {
  //     //   assert.equal(formatProtocol(6), 'TCP');
  //     // });
  //     // it('UDP', () => {
  //     //   assert.equal(formatProtocol(17), 'UDP');
  //     // });
  //     // it('Unassigned', () => {
  //     //   assert.equal(formatProtocol(144), '144');
  //     // });
  //   });

  //   describe('protocolFormatter', () => {
  //     it('General', () => {
  //       // const input = '1, 6, 17, 30-40, 50, 60-70';
  //       // // TODO: deal with protocol names with dashes.
  //       // const expected = 'ICMP, TCP, UDP, NETBLT-IL, ESP, IPv6-Opts-VISA';
  //       // const r1 = parseProtocolSet(protocols, input);
  //       // assert.equal(protocolFormatter(r1.dimensions[0].range), expected);
  //     });
  //   });
  // });
});
