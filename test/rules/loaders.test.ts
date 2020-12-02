import {assert} from 'chai';
import 'mocha';

import {Universe} from '../../src/dimensions';

import {
  denyOverrides,
  firstApplicable,
  loadCsvRulesString,
} from '../../src/rules';

import {firewallSpec} from '../../src/specs';

const universe = new Universe(firewallSpec);

describe('Rules', () => {
  describe('Loaders', () => {
    it('loadCsvRulesString()', () => {
      const text = `action,sourceIp,sourcePort,protocol
                    allow,1.1.1.1,123,tcp
                    deny,2.2.2.0/24,ftp,tcp`;

      const rules = loadCsvRulesString(universe, text);
      const observed = rules[0].conjunction.format();
      const expected = 'source ip: 1.1.1.1\nsource port: 123\nprotocol: tcp';
      assert.equal(observed, expected);
    });

    it('loadYamlRulesString()', () => {
      assert.fail();
    });
  });

  describe('denyOverrides()', () => {
    it('test()', () => {
      assert.fail();
    });
  });

  describe('firstApplicable()', () => {
    it('test()', () => {
      const text = `action,sourceIp
                    deny,2.2.2.128
                    allow,2.2.2.0/24`;

      const rules = loadCsvRulesString(universe, text);
      const e = firstApplicable(rules);
      console.log(e.format());
      const observed = e.format();
      // TODO: this test is brittle because the expected value
      // could be in a different order. Really need to do a set
      // equivalence test.
      const expected = 'source ip: 2.2.2.0/25, 2.2.2.129-2.2.2.255';
      assert.equal(observed, expected);
    });

    it('test2()', () => {
      const text = `action,sourceIp,sourcePort
                    deny,2.2.2.128
                    allow,2.2.2.0/24
                    deny,any,80
                    allow,1.1.1.1`;

      const rules = loadCsvRulesString(universe, text);
      const e = firstApplicable(rules);
      // const e = denyOverrides(rules);
      console.log(e.format());
      const observed = e.format();
      // TODO: this test is brittle because the expected value
      // could be in a different order. Really need to do a set
      // equivalence test.
      const expected = 'foobar';
      assert.equal(observed, expected);
    });
  });
});
