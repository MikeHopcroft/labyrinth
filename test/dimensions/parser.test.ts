import {assert} from 'chai';
import 'mocha';

import {DimensionType} from '../../src/dimensions';

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
const parsePortSet = portType.parser;

const protocolType = new DimensionType({
  name: 'protocol',
  key: 'protocol',
  parser: 'default',
  formatter: 'default',
  domain: '00-0xff',
  values: [
    {symbol: 'ICMP', range: '1'},
    {symbol: 'TCP', range: '6'},
    {symbol: 'UDP', range: '17'},
  ],
});
const parseProtocolSet = protocolType.parser;

describe('Parser', () => {
  describe('parseIpSet', () => {
    it('invalid', () => {
      // Random identifier not in predefined symbols
      assert.throws(
        () => parseIpSet('abc'),
        'Dimension "ip address": unknown ip address "abc".'
      );

      // Incomplete
      assert.throws(
        () => parseIpSet('1.1.1'),
        'Invalid IPv4 address: "1.1.1".'
      );

      // TODO: REVIEW: commented out because `ip` package allows this ip address.
      // assert.throws(
      //   () => parseIpSet(ips, '500.500.500.500'),
      //   'Invalid IPv4 address: "1.1.1".'
      // );

      // IPv6

      // Too many dashes
      assert.throws(
        () => parseIpSet('1.1.1.1-2.2.2.2-3.3.3.3'),
        'Invalid ip address "1.1.1.1-2.2.2.2-3.3.3.3".'
      );

      // * or any comingled
      assert.throws(
        () => parseIpSet('1.1.1.1,any'),
        '"*" and "any" may not be used with any other ip address.'
      );
      assert.throws(
        () => parseIpSet('1.1.1.1,*'),
        '"*" and "any" may not be used with any other ip address.'
      );

      // Range start beyond range end
      assert.throws(
        () => parseIpSet('2.2.2.2-1.1.1.1'),
        'Start ip address 2.2.2.2 must be less than end ip address 1.1.1.1.'
      );
      assert.throws(
        () => parseIpSet('3.3.3.3-3.3.3.3'),
        'Start ip address 3.3.3.3 must be less than end ip address 3.3.3.3.'
      );
    });

    it('any', () => {
      const r1 = parseIpSet('any');
      assert.deepEqual(r1, ipType.domain);

      const r2 = parseIpSet('*');
      assert.deepEqual(r2, ipType.domain);
    });

    it('single address', () => {
      const r1 = parseIpSet('1.1.1.1');
      assert.equal(r1.length, 1);
      assert.equal(r1.toString(), `[ ${0x01010101} ]`);
    });

    it('address range', () => {
      const r1 = parseIpSet('1.1.1.1-1.1.1.5');
      assert.equal(r1.length, 5);
      assert.equal(r1.toString(), `[ ${0x01010101}-${0x01010105} ]`);
    });

    it('CIDR', () => {
      const r1 = parseIpSet('1.1.1.0/24');
      assert.equal(r1.length, 256);
      assert.equal(r1.toString(), `[ ${0x01010100}-${0x010101ff} ]`);
    });

    it('address list', () => {
      const r1 = parseIpSet('0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3');
      assert.equal(r1.length, 261);
      assert.equal(
        r1.toString(),
        `[ ${0x00000001}, ${0x01010100}-${0x010101ff}, ${0x02000000}-${0x02000003} ]`
      );
    });
  });

  describe('parsePortSet', () => {
    it('invalid', () => {
      // Non-numeric
      // Random identifier not in predefined symbols
      assert.throws(
        () => parsePortSet('abc'),
        'Dimension "port": unknown port "abc".'
      );

      // Out of range
      assert.throws(() => parsePortSet('-1'), 'Invalid port "-1".');
      assert.throws(
        () => parsePortSet('65536'),
        'Invalid port number 65536 out of range [0,65535].'
      );

      // Not integer
      assert.throws(
        () => parsePortSet('1.234'),
        'Port number 1.234 must be an integer.'
      );

      // Too many dashes
      assert.throws(() => parsePortSet('1-2-3'), 'Invalid port "1-2-3".');

      // * or any comingled
      assert.throws(
        () => parsePortSet('1,any'),
        '"*" and "any" may not be used with any other port.'
      );
      assert.throws(
        () => parsePortSet('1,*'),
        '"*" and "any" may not be used with any other port.'
      );

      // Range start beyond range end
      assert.throws(
        () => parsePortSet('3-2'),
        'Start port 3 must be less than end port 2.'
      );
      assert.throws(
        () => parsePortSet('3-3'),
        'Start port 3 must be less than end port 3.'
      );
    });

    it('any', () => {
      const r1 = parsePortSet('any');
      assert.equal(r1.length, 65536);

      const r2 = parsePortSet('*');
      assert.equal(r2.length, 65536);
    });

    it('single port', () => {
      const r1 = parsePortSet('1234');
      assert.equal(r1.length, 1);
      assert.equal(r1.toString(), '[ 1234 ]');
    });

    it('single port - hexidecimal', () => {
      const r1 = parsePortSet('0x1234');
      assert.equal(r1.length, 1);
      assert.equal(r1.toString(), `[ ${0x1234} ]`);
    });

    it('port range', () => {
      const r1 = parsePortSet('567-789');
      assert.equal(r1.length, 789 - 567 + 1);
      assert.equal(r1.toString(), '[ 567-789 ]');
    });

    it('port list', () => {
      const r1 = parsePortSet('1,10-20, 30, 40, 50-60');
      assert.equal(r1.length, 25);
      assert.equal(r1.toString(), '[ 1, 10-20, 30, 40, 50-60 ]');
    });
  });

  describe('parseProtocolSet', () => {
    it('invalid', () => {
      // Non-numeric
      assert.throws(
        () => parseProtocolSet('abc'),
        'Dimension "protocol": unknown protocol "abc".'
      );

      // Out of range
      assert.throws(() => parseProtocolSet('-1'), 'Invalid protocol "-1".');

      // Out of range
      assert.throws(
        () => parseProtocolSet('256'),
        'Invalid protocol number 256 out of range [0,255].'
      );

      // Not integer
      assert.throws(
        () => parseProtocolSet('1.234'),
        'Protocol number 1.234 must be an integer.'
      );

      // Too many dashes
      assert.throws(
        () => parseProtocolSet('1-2-3'),
        'Invalid protocol "1-2-3".'
      );

      // * or any comingled
      assert.throws(
        () => parseProtocolSet('1,any'),
        '"*" and "any" may not be used with any other protocol.'
      );
      assert.throws(
        () => parseProtocolSet('1,*'),
        '"*" and "any" may not be used with any other protocol.'
      );

      // Range start beyond range end
      assert.throws(
        () => parseProtocolSet('3-2'),
        'Start protocol 3 must be less than end protocol 2.'
      );
      assert.throws(
        () => parseProtocolSet('3-3'),
        'Start protocol 3 must be less than end protocol 3.'
      );
    });

    it('any', () => {
      const r1 = parseProtocolSet('any');
      assert.equal(r1.length, 256);

      const r2 = parseProtocolSet('*');
      assert.equal(r2.length, 256);
    });

    it('single numeric protocol', () => {
      const r1 = parseProtocolSet('17');
      assert.equal(r1.length, 1);
      assert.equal(r1.toString(), '[ 17 ]');
    });

    it('single numeric protocol - hexidecimal', () => {
      const r1 = parseProtocolSet('0x17');
      assert.equal(r1.length, 1);
      assert.equal(r1.toString(), `[ ${0x17} ]`);
    });

    it('single symbolic protocol', () => {
      const r1 = parseProtocolSet('TCP');
      assert.equal(r1.length, 1);
      assert.equal(r1.toString(), '[ 6 ]');
    });

    it('numeric protocol range', () => {
      const r1 = parseProtocolSet('6-17');
      assert.equal(r1.length, 12);
      assert.equal(r1.toString(), '[ 6-17 ]');
    });

    it('symbolic protocol range', () => {
      const r1 = parseProtocolSet('TCP-UDP');
      assert.equal(r1.length, 12);
      assert.equal(r1.toString(), '[ 6-17 ]');
    });

    it('protocol list', () => {
      const r1 = parseProtocolSet('ICMP, TCP, 30-40, UDP, 50, 60-70');
      assert.equal(r1.length, 26);
      assert.equal(r1.toString(), '[ 1, 6, 17, 30-40, 50, 60-70 ]');
    });
  });
});
