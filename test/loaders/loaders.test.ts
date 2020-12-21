import {assert} from 'chai';
import 'mocha';

import {Universe} from '../../src/dimensions';

import {
  createSimplifier,
  denyOverrides,
  firstApplicable,
  formatRule,
  loadCsvRulesString,
  loadYamlRulesString,
} from '../../src/loaders';

import {RuleSpec} from '../../src/setops';
import {firewallSpec} from '../../src/specs';
import {stripLeadingSpaces} from '../shared';

const universe = new Universe(firewallSpec);
const simplifier = createSimplifier<RuleSpec>(universe);

const policy1Yaml = `
rules:
  - action: deny
    priority: 1
    sourceIp: 10.0.0.0/8
  - action: allow
    priority: 2
    destinationIp: 171.64.64.0/20
  - action: deny
    priority: 3
    destinationPort: 445
    protocol: tcp, udp
  - action: allow
    priority: 4
    destinationIp: 128.30.0.0/15
`;

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
      const rules = loadYamlRulesString(universe, policy1Yaml);
      // const observed = rules.map(r => r.conjunction.format()).join('\n\n');
      const observed = rules.map(r => formatRule(r)).join('\n');
      const expected = stripLeadingSpaces(`\
        action: deny
        priority: 1
        source ip: 10.0.0.0/8

        action: allow
        priority: 2
        destination ip: 171.64.64.0/20

        action: deny
        priority: 3
        destination port: 445
        protocol: tcp, udp

        action: allow
        priority: 4
        destination ip: 128.30.0.0/15
      `);
      // console.log(observed);
      assert.equal(observed, expected);
    });
  });

  describe('denyOverrides()', () => {
    it('test()', () => {
      const text = `action,sourceIp
                    deny,2.2.2.128
                    allow,2.2.2.0/24
                    deny,2.2.2.129`;

      const rules = loadCsvRulesString(universe, text);
      const e = denyOverrides(rules, simplifier);
      // console.log(e.format());
      const observed = e.format();
      // TODO: this test is brittle because the expected value
      // could be in a different order. Really need to do a set
      // equivalence test.
      const expected = 'source ip: 2.2.2.0/25, 2.2.2.130-2.2.2.255';
      assert.equal(observed, expected);
    });
  });

  describe('firstApplicable()', () => {
    it('test()', () => {
      const text = `action,sourceIp
                    deny,2.2.2.128
                    allow,2.2.2.0/24
                    deny,2.2.2.129`;

      const rules = loadCsvRulesString(universe, text);
      const e = firstApplicable(rules, simplifier);
      // console.log(e.format());
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
      const e = firstApplicable(rules, simplifier);
      // const e = denyOverrides(rules);
      // console.log(e.format());
      const observed = e.format();
      // TODO: this test is brittle because the expected value
      // could be in a different order. Really need to do a set
      // equivalence test.
      const expected =
        'source ip: 2.2.2.0/25, 2.2.2.129-2.2.2.255\n\nsource ip: 1.1.1.1\nsource port: except 80';
      assert.equal(observed, expected);
    });
  });
});
