import {assert} from 'chai';
import DRange from 'drange';
import 'mocha';

import {
  parsePortSet,
  parseProtocolSet
} from '../../src/rules';

import { Dimension } from '../../src/setops';

const dimension = Dimension.create(0, 65535);

describe('Parser', () => {
  describe('parsePortSet', () => {
    it('invalid', () => {
      // Non-numeric
      assert.throws(
        () => parsePortSet(dimension, 'abc'),
        'Expected port number or range, but found "abc".'
      );

      // Out of range
      assert.throws(
        () => parsePortSet(dimension, '-1'),
        'Expected port number or range, but found "-1".'
      );
      assert.throws(
        () => parsePortSet(dimension, '65536'),
        'Port 65536 out of range [0,65535].'
      );

      // Not integer
      assert.throws(
        () => parsePortSet(dimension, '1.234'),
        'Expected port number or range, but found "1.234".'
      );

      // Too many dashes
      assert.throws(
        () => parsePortSet(dimension, '1-2-3'),
        'Expected port number or range, but found "1-2-3".'
      );

      // * or any comingled
      assert.throws(
        () => parsePortSet(dimension, '1,any'),
        'Expected port number or range, but found "any".'
      );
      assert.throws(
        () => parsePortSet(dimension, '1,*'),
        'Expected port number or range, but found "*".'
      );

      // Range start beyond range end
      assert.throws(
        () => parsePortSet(dimension, '3-2'),
        'Start port 3 must be less than end port 2.'
      );
      assert.throws(
        () => parsePortSet(dimension, '3-3'),
        'Start port 3 must be less than end port 3.'
      );
    });

    it('any', () => {
      const r1 = parsePortSet(dimension, 'any');
      assert.equal(r1.dimensions.length, 0);

      const r2 = parsePortSet(dimension, '*');
      assert.equal(r2.dimensions.length, 0);
    });

    it('single port', () => {
      const r1 = parsePortSet(dimension, '1234');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 1234 ]`);
    });

    it('port range', () => {
      const r1 = parsePortSet(dimension, '567-789');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 567-789 ]`);
    });

    it('port list', () => {
      const r1 = parsePortSet(dimension, '1,10-20, 30, 40, 50-60');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 1, 10-20, 30, 40, 50-60 ]`);
    });
  });

  describe('parseProtocolSet', () => {
    it('invalid', () => {
      // Non-numeric
      assert.throws(
        () => parseProtocolSet(dimension, 'abc'),
        'Unknown protocol "abc".'
      );
      assert.throws(
        // TODO: Consider adding support for symbolic ranges.
        () => parseProtocolSet(dimension, 'TCP-UDP'),
        'Unknown protocol "TCP-UDP".'
      );

      // Out of range
      assert.throws(
        () => parseProtocolSet(dimension, '-1'),
        'Unknown protocol "-1".'
      );
      assert.throws(
        () => parseProtocolSet(dimension, '256'),
        'Protocol 256 out of range [0,255].'
      );

      // Not integer
      assert.throws(
        () => parseProtocolSet(dimension, '1.234'),
        'Unknown protocol "1.234".'
      );

      // Too many dashes
      assert.throws(
        () => parseProtocolSet(dimension, '1-2-3'),
        'Unknown protocol "1-2-3".'
      );

      // * or any comingled
      assert.throws(
        () => parseProtocolSet(dimension, '1,any'),
        '"*" and "any" may not be used with any other protocol.'
      );
      assert.throws(
        () => parseProtocolSet(dimension, '1,*'),
        '"*" and "any" may not be used with any other protocol.'
      );

      // Range start beyond range end
      assert.throws(
        () => parseProtocolSet(dimension, '3-2'),
        'Start protocol 3 must be less than end protocol 2.'
      );
      assert.throws(
        () => parseProtocolSet(dimension, '3-3'),
        'Start protocol 3 must be less than end protocol 3.'
      );
    });

    it('TODO: fix dimension', () => {
      // TODO: protocol tests need their own dimension
      assert.fail();
    });

    it('any', () => {
      const r1 = parseProtocolSet(dimension, 'any');
      assert.equal(r1.dimensions.length, 0);

      const r2 = parseProtocolSet(dimension, '*');
      assert.equal(r2.dimensions.length, 0);
    });

    it('single numeric protocol', () => {
      const r1 = parseProtocolSet(dimension, '17');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 17 ]`);
    });

    it('single symbolic protocol', () => {
      const r1 = parseProtocolSet(dimension, 'TCP');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 6 ]`);
    });

    it('numeric protocol range', () => {
      const r1 = parseProtocolSet(dimension, '6-17');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 6-17 ]`);
    });

    it('protocol list', () => {
      const r1 = parseProtocolSet(dimension, 'TCP, 30-40, UDP, 50, 60-70');
      assert.equal(r1.dimensions.length, 1);
      assert.equal(r1.dimensions[0].toString(), `${dimension.id}: [ 6, 17, 30-40, 50, 60-70 ]`);
    });
  });
});
