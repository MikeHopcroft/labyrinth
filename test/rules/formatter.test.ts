import { assert } from 'chai';
import DRange from 'drange';
import * as ip from 'ip';
import 'mocha';

import {
  formatIpRange,
  formatProtocol,
  ipFormatter,
  parseIpSet,
  parsePortSet,
  parseProtocolSet,
  portFormatter,
  protocolFormatter
} from '../../src/rules';

import {Dimension} from '../../src/setops';

const formatter = (r: DRange) => '';
const ips = Dimension.create('source ip', 'ip address', formatter, 0, 4294967295);
const ports = Dimension.create('source port', 'port', formatter, 0, 65535);
const protocols = Dimension.create('protcol', 'protocol', formatter, 0, 255);

describe('Formatters', () => {
  describe('ip', () => {
    describe('formatIpRange()', () => {
      it('CIDR block', () => {
        assert.equal(
          formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.1')),
          '1.1.1.0/31'
        );
        assert.equal(
          formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.3')),
          '1.1.1.0/30'
        );
        assert.equal(
          formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.255')),
          '1.1.1.0/24'
        );
      });

      it('Range (not CIDR block)', () => {
        assert.equal(
          formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.8')),
          '1.1.1.0-1.1.1.8'
        );
      });

      it('Single ip address', () => {
        assert.equal(
          formatIpRange(ip.toLong('1.1.1.0'), ip.toLong('1.1.1.0')),
          '1.1.1.0'
        );
      });
    });

    describe('ipFormatter', () => {
      it('General', () => {
        const input = '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3, 5.5.5.1-6.6.6.1';
        const expected = '1, 1.1.1.0/24, 2.0.0.0/30, 5.5.5.1-6.6.6.1'
        const r1 = parseIpSet(ips, input);
        assert.equal(ipFormatter(r1.dimensions[0].range), expected)
      });
    });
  });

  describe('port', () => {
    it('portFormatter', () => {
      const input = '1, 6, 17, 30-40, 50, 60-70';
      const expected = '1, 6, 17, 30-40, 50, 60-70';
      const r1 = parsePortSet(ports, input);
      assert.equal(portFormatter(r1.dimensions[0].range), expected)
    });
  });

  describe('protocol', () => {
    describe('formatProtocol()', () => {
      it('TCP', () => {
        assert.equal(
          formatProtocol(6),
          'TCP'
        );
      });
      it('UDP', () => {
        assert.equal(
          formatProtocol(17),
          'UDP'
        );
      });
      it('Unassigned', () => {
        assert.equal(
          formatProtocol(144),
          '144'
        );
      });
    });

    describe('protocolFormatter', () => {
      it('General', () => {
        const input = '1, 6, 17, 30-40, 50, 60-70';
        // TODO: deal with protocol names with dashes.
        const expected = 'ICMP, TCP, UDP, NETBLT-IL, ESP, IPv6-Opts-VISA';
        const r1 = parseProtocolSet(protocols, input);
        assert.equal(protocolFormatter(r1.dimensions[0].range), expected)
      });
    });
  });
});
