import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';

import {
  parseIpSet,
  parsePortSet,
  parseProtocolSet
} from '../../src/rules';

import { Dimension } from '../../src/setops';

const ips = Dimension.create(0, 4294967295);
const ports = Dimension.create(0, 65535);
const protocols = Dimension.create(0, 255);

describe('Parser', () => {
  describe('parseIpSet', () => {
    it('invalid', () => {
      // Random word
      assert.throws(
        () => parseIpSet(ips, 'abc'),
        'Invalid IPv4 address: \"abc\".'
      );

      // Incomplete
      assert.throws(
        () => parseIpSet(ips, '1.1.1'),
        'Invalid IPv4 address: \"1.1.1\".'
      );

      // // Out of range
      // assert.throws(
      //   () => parsePortSet(ports, '-1'),
      //   'Invalid port number -1 out of range [0,65535].'
      // );
      // assert.throws(
      //   () => parsePortSet(ports, '65536'),
      //   'Invalid port number 65536 out of range [0,65535].'
      // );

      // // Not integer
      // assert.throws(
      //   () => parsePortSet(ports, '1.234'),
      //   'Port number 1.234 must be an integer.'
      // );

      // // Too many dashes
      // assert.throws(
      //   () => parsePortSet(ports, '1-2-3'),
      //   'Expected port number but found \"1-2-3\".'
      // );

      // // * or any comingled
      // assert.throws(
      //   () => parsePortSet(ports, '1,any'),
      //   '\"*\" and \"any\" may not be used with any other port.'
      // );
      // assert.throws(
      //   () => parsePortSet(ports, '1,*'),
      //   '\"*\" and \"any\" may not be used with any other port.'
      // );

      // // Range start beyond range end
      // assert.throws(
      //   () => parsePortSet(ports, '3-2'),
      //   'Start port 3 must be less than end port 2.'
      // );
      // assert.throws(
      //   () => parsePortSet(ports, '3-3'),
      //   'Start port 3 must be less than end port 3.'
      // );
    });

    it('any', () => {
      const r1 = parseIpSet(ips, 'any');
      assert.equal(r1.dimensions.length, 0);

      const r2 = parseIpSet(ips, '*');
      assert.equal(r2.dimensions.length, 0);
    });

    it('single address', () => {
      const r1 = parseIpSet(ips, '1.1.1.1');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ips.id}: [ 16843009 ]`);
    });

    it('address range', () => {
      const r1 = parseIpSet(ips, '1.1.1.1-1.1.1.5');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ips.id}: [ 16843009-16843013 ]`);
    });

    it('CIDR', () => {
      const r1 = parseIpSet(ips, '1.1.1.0/24');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ips.id}: [ 16843008-16843263 ]`);
    });

    it('address list', () => {
      const r1 = parseIpSet(ips, '0.0.0.1, 1.1.1.0/24, 2.0.0.0-2.0.0.3');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ips.id}: [ 1, 16843008-16843263, 33554432-33554435 ]`);
    });
  });

  describe('parsePortSet', () => {
    it('invalid', () => {
      // Non-numeric
      assert.throws(
        () => parsePortSet(ports, 'abc'),
        'Expected port number but found "abc".'
      );

      // Out of range
      assert.throws(
        () => parsePortSet(ports, '-1'),
        'Invalid port number -1 out of range [0,65535].'
      );
      assert.throws(
        () => parsePortSet(ports, '65536'),
        'Invalid port number 65536 out of range [0,65535].'
      );

      // Not integer
      assert.throws(
        () => parsePortSet(ports, '1.234'),
        'Port number 1.234 must be an integer.'
      );

      // Too many dashes
      assert.throws(
        () => parsePortSet(ports, '1-2-3'),
        'Expected port number but found \"1-2-3\".'
      );

      // * or any comingled
      assert.throws(
        () => parsePortSet(ports, '1,any'),
        '\"*\" and \"any\" may not be used with any other port.'
      );
      assert.throws(
        () => parsePortSet(ports, '1,*'),
        '\"*\" and \"any\" may not be used with any other port.'
      );

      // Range start beyond range end
      assert.throws(
        () => parsePortSet(ports, '3-2'),
        'Start port 3 must be less than end port 2.'
      );
      assert.throws(
        () => parsePortSet(ports, '3-3'),
        'Start port 3 must be less than end port 3.'
      );
    });

    it('any', () => {
      const r1 = parsePortSet(ports, 'any');
      assert.equal(r1.dimensions.length, 0);

      const r2 = parsePortSet(ports, '*');
      assert.equal(r2.dimensions.length, 0);
    });

    it('single port', () => {
      const r1 = parsePortSet(ports, '1234');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ports.id}: [ 1234 ]`);
    });

    it('port range', () => {
      const r1 = parsePortSet(ports, '567-789');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ports.id}: [ 567-789 ]`);
    });

    it('port list', () => {
      const r1 = parsePortSet(ports, '1,10-20, 30, 40, 50-60');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${ports.id}: [ 1, 10-20, 30, 40, 50-60 ]`);
    });
  });

  describe('parseProtocolSet', () => {
    it('invalid', () => {
      // Non-numeric
      assert.throws(
        () => parseProtocolSet(protocols, 'abc'),
        'Unknown protocol "abc".'
      );
      assert.throws(
        // TODO: Consider adding support for symbolic ranges.
        () => parseProtocolSet(protocols, 'TCP-UDP'),
        'Unknown protocol "TCP-UDP".'
      );

      // Out of range
      assert.throws(
        () => parseProtocolSet(protocols, '-1'),
        'Invalid protocol number -1 out of range [0,255].'
      );
      assert.throws(
        () => parseProtocolSet(protocols, '256'),
        'Invalid protocol number 256 out of range [0,255].'
      );

      // Not integer
      assert.throws(
        () => parseProtocolSet(protocols, '1.234'),
        'Protocol number 1.234 must be an integer.'
      );

      // Too many dashes
      assert.throws(
        () => parseProtocolSet(protocols, '1-2-3'),
        'Unknown protocol "1-2-3".'
      );

      // * or any comingled
      assert.throws(
        () => parseProtocolSet(protocols, '1,any'),
        '"*" and "any" may not be used with any other protocol.'
      );
      assert.throws(
        () => parseProtocolSet(protocols, '1,*'),
        '"*" and "any" may not be used with any other protocol.'
      );

      // Range start beyond range end
      assert.throws(
        () => parseProtocolSet(protocols, '3-2'),
        'Start protocol 3 must be less than end protocol 2.'
      );
      assert.throws(
        () => parseProtocolSet(protocols, '3-3'),
        'Start protocol 3 must be less than end protocol 3.'
      );
    });

    it('TODO: fix dimension', () => {
      // TODO: protocol tests need their own dimension
      // TODO: test for symbolic ranges used in range expressions.
      //       start and end of range must resolve to singletons.
      assert.fail();
    });

    it('any', () => {
      const r1 = parseProtocolSet(protocols, 'any');
      assert.equal(r1.dimensions.length, 0);

      const r2 = parseProtocolSet(protocols, '*');
      assert.equal(r2.dimensions.length, 0);
    });

    it('single numeric protocol', () => {
      const r1 = parseProtocolSet(protocols, '17');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${protocols.id}: [ 17 ]`);
    });

    it('single symbolic protocol', () => {
      const r1 = parseProtocolSet(protocols, 'TCP');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${protocols.id}: [ 6 ]`);
    });

    it('numeric protocol range', () => {
      const r1 = parseProtocolSet(protocols, '6-17');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${protocols.id}: [ 6-17 ]`);
    });

    it('protocol list', () => {
      const r1 = parseProtocolSet(protocols, 'ICMP, TCP, 30-40, UDP, 50, 60-70');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${protocols.id}: [ 1, 6, 17, 30-40, 50, 60-70 ]`);
    });
  });
});
