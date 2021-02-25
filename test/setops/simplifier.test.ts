import {assert} from 'chai';
import 'mocha';

import {Universe, UniverseSpec} from '../../src/dimensions';

import {
  ActionType,
  denyOverrides,
  parseRuleSpec,
  Rule,
  RuleSpec,
} from '../../src/rules';

import {
  createConjunctionInfo,
  createSimplifier,
  simplify,
} from '../../src/setops';

const universeSpec: UniverseSpec = {
  types: [
    {
      name: 'ip address',
      key: 'ip',
      parser: 'ip',
      formatter: 'ip',
      domain: '0.0.0.0-255.255.255.255',
      values: [],
    },
    {
      name: 'port',
      key: 'port',
      parser: 'default',
      formatter: 'default',
      domain: '00-0xffff',
      values: [],
    },
    {
      name: 'protocol',
      key: 'protocol',
      parser: 'default',
      formatter: 'default',
      domain: '00-0xff',
      values: [
        {symbol: 'TCP', range: '6'},
        {symbol: 'UDP', range: '17'},
      ],
    },
  ],
  dimensions: [
    {
      name: 'source ip',
      key: 'sourceIp',
      type: 'ip',
    },
    {
      name: 'source port',
      key: 'sourcePort',
      type: 'port',
    },
    {
      name: 'destination ip',
      key: 'destinationIp',
      type: 'ip',
    },
    {
      name: 'destination port',
      key: 'destinationPort',
      type: 'port',
    },
    {
      name: 'protocol',
      key: 'protocol',
      type: 'protocol',
    },
  ],
};

const universe = new Universe(universeSpec);
const simplifier = createSimplifier<RuleSpec>(universe);

describe('Simplifier', () => {
  it('createConjunctionInfo', () => {
    const spec: RuleSpec = {
      id: 1,
      source: 'policy',
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP,UDP',
      sourcePort: '80',
    };
    const rule1: Rule = parseRuleSpec(universe, spec);

    const info = createConjunctionInfo(universe.dimensions, rule1.conjunction);
    assert.equal(info.factors.length, universe.dimensions.length);
    assert.equal(
      info.factors[0].key,
      '[sourceIp]\nsource port: 80\ndestination ip: *\ndestination port: *\nprotocol: 6, 17'
    );
    assert.equal(
      info.factors[1].key,
      `source ip: ${0x7f000001}\n[sourcePort]\ndestination ip: *\ndestination port: *\nprotocol: 6, 17`
    );
    assert.equal(
      info.factors[2].key,
      `source ip: ${0x7f000001}\nsource port: 80\n[destinationIp]\ndestination port: *\nprotocol: 6, 17`
    );
  });

  describe('simplify()', () => {
    it('first', () => {
      const ruleSpecs = [
        {
          id: 1,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
          destinationPort: '100',
        },
        {
          id: 2,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '2',
          destinationPort: '100',
        },
        {
          id: 3,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '3',
          destinationPort: '200',
        },
      ];

      const rules = ruleSpecs.map(r => parseRuleSpec(universe, r));
      const expression = denyOverrides(rules, simplifier);

      // console.log('Before simplification:');
      // console.log(expression.format());
      // console.log();

      const simplified = simplifier(expression);

      // console.log('After simplification:');
      // console.log(simplified.format());
      // console.log();

      // TODO: this test is brittle because the algorithm could get the right
      // answer in a different order.
      const expected =
        'source port: 1-2\ndestination port: 100\n\nsource port: 3\ndestination port: 200';
      const observed = simplified.format();
      assert.equal(observed, expected);
    });

    it('(a+b)(c+d)', () => {
      const ruleSpecs1 = [
        {
          id: 1,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
        },
        {
          id: 2,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          destinationPort: '101',
        },
      ];

      const ruleSpecs2 = [
        {
          id: 3,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          destinationPort: '101',
        },
        {
          id: 4,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '2',
        },
      ];

      const rules1 = ruleSpecs1.map(r => parseRuleSpec(universe, r));
      const rules2 = ruleSpecs2.map(r => parseRuleSpec(universe, r));
      const expression1 = denyOverrides(rules1, simplifier);
      const expression2 = denyOverrides(rules2, simplifier);
      const expression = expression1.intersect(expression2);

      // console.log('Before simplification:');
      // console.log(expression.format());
      // console.log();

      const simplified = simplify(universe.dimensions, expression);

      // console.log('After simplification:');
      // console.log(simplified.format());
      // console.log();

      // Result should be simpler than
      // After simplification:
      //
      // destination port: 101
      //
      // source port: 1-2
      // destination port: 101

      // Keys need to contain '*' dimensions.

      // TODO: this test is brittle because the algorithm could get the right
      // answer in a different order.
      const expected = 'destination port: 101';
      const observed = simplified.format();
      assert.equal(observed, expected);
    });

    it('(a+b)(a+b)', () => {
      const ruleSpecs1 = [
        {
          id: 1,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
        },
        {
          id: 2,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          destinationPort: '101',
        },
      ];

      // const ruleSpecs2 = [
      //   {
      //     action: ActionType.ALLOW,
      //     priority: 1,
      //     destPort: '101'
      //   },
      //   {
      //     action: ActionType.ALLOW,
      //     priority: 1,
      //     sourcePort: '2'
      //   },
      // ];

      // Causes exception:
      //   TypeError: Entry not in priority queue
      //     at addConjunction (build\src\setops\simplifier.js:129:23)
      //     at Object.simplify (build\src\setops\simplifier.js:29:9)
      //     at Context.<anonymous> (build\test\setops\simplifier.test.js:118:41)
      const rules1 = ruleSpecs1.map(r => parseRuleSpec(universe, r));
      // const rules2 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
      const expression1 = denyOverrides(rules1, simplifier);
      // const expression2 = evaluate(rules2);
      const expression = expression1.intersect(expression1);

      // Similar code does not cause exception:
      // const rules1 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
      // const expression1 = evaluate(rules1);
      // const expression = expression1.intersect(expression1);

      // console.log('Before simplification:');
      // console.log(expression.format());
      // console.log();

      const simplified = simplify(universe.dimensions, expression);

      // console.log('After simplification:');
      // console.log(simplified.format());
      // console.log();

      // TODO: this test is brittle because the algorithm could get the right
      // answer in a different order.
      const expected = 'destination port: 101\n\nsource port: 1';
      const observed = simplified.format();
      assert.equal(observed, expected);
    });

    it('chain', () => {
      // These rules should trigger a chain of simplifications:
      //   1. Merge source ports of first two rules, yielding 1-2
      //   2. Merge dest ports of this result with third rule, yielding 100-101
      //   3. Merge protocol of this result with fourth rule, yielding TCP, UDP
      const ruleSpecs = [
        {
          id: 1,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
          destinationPort: '100',
          protocol: 'TCP',
        },
        {
          id: 2,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '2',
          destinationPort: '100',
          protocol: 'TCP',
        },
        {
          id: 3,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1-2',
          destinationPort: '101',
          protocol: 'TCP',
        },
        {
          id: 4,
          source: 'policy',
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1-2',
          destinationPort: '100-101',
          protocol: 'UDP',
        },
      ];

      const rules = ruleSpecs.map(r => parseRuleSpec(universe, r));
      const expression = denyOverrides(rules, simplifier);

      // console.log('Before simplification:');
      // console.log(expression.format());
      // console.log();

      const simplified = simplify(universe.dimensions, expression);

      // console.log('After simplification:');
      // console.log(simplified.format());
      // console.log();

      // TODO: this test is brittle because the algorithm could get the right
      // answer in a different order.
      const expected =
        'source port: 1-2\ndestination port: 100-101\nprotocol: TCP, UDP';
      const observed = simplified.format();
      assert.equal(observed, expected);
    });
  });
});
