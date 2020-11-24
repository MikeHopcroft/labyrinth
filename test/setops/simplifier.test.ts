import {assert} from 'chai';
import 'mocha';

import {
  ActionType,
  createFormatter,
  createNumberSymbolFormatter,
  createIpFormatter,
  evaluate,
  // ipFormatter,
  parseRuleSpec,
  // portFormatter,
  // protocolFormatter,
  Rule,
  RuleDimensions,
  // RuleSpec
} from '../../src/rules';

import {createConjunctionInfo, Dimension, simplify} from '../../src/setops';

const ipFormatter = createFormatter(
  createIpFormatter(new Map<string, string>())
);

const portFormatter = createFormatter(
  createNumberSymbolFormatter(new Map<string, string>())
);

const protocolFormatter = createFormatter(
  createNumberSymbolFormatter(
    new Map<string, string>([
      ['6', 'TCP'],
      ['17', 'UDP'],
    ])
  )
);

const sourceIp = Dimension.create(
  'source ip',
  'ip address',
  ipFormatter,
  0,
  0xffffffff
  // 4294967295
);

const sourcePort = Dimension.create(
  'source port',
  'port',
  portFormatter,
  0,
  0xffff
  // 65535
);

const destIp = Dimension.create(
  'destination ip',
  'ip address',
  ipFormatter,
  0,
  0xffffffff
  // 4294967295
);

const destPort = Dimension.create(
  'destination port',
  'port',
  portFormatter,
  0,
  0xffff
  // 65535
);

const protocol = Dimension.create(
  'protocol',
  'protocol',
  protocolFormatter,
  0,
  0xff
  // 255
);

const dimensionList = [sourceIp, sourcePort, destIp, destPort, protocol];

const dimensions: RuleDimensions = {
  sourceIp,
  sourcePort,
  destIp,
  destPort,
  protocol,
};

describe('Simplifier', () => {
  it('createConjunctionInfo', () => {
    const rule1: Rule = parseRuleSpec(dimensions, {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP,UDP',
      sourcePort: '80',
    });

    const info = createConjunctionInfo(dimensionList, rule1.conjunction);
    assert.equal(info.factors.length, dimensionList.length);
    assert.equal(
      info.factors[0].key,
      '\nsource port: 80\ndestination ip: *\ndestination port: *\nprotocol: TCP, UDP'
    );
    assert.equal(
      info.factors[1].key,
      'source ip: 127.0.0.1\n\ndestination ip: *\ndestination port: *\nprotocol: TCP, UDP'
    );
    assert.equal(
      info.factors[2].key,
      'source ip: 127.0.0.1\nsource port: 80\n\ndestination port: *\nprotocol: TCP, UDP'
    );
  });

  describe('simplify()', () => {
    it('first', () => {
      const ruleSpecs = [
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
          destPort: '100',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '2',
          destPort: '100',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '3',
          destPort: '200',
        },
      ];

      const rules = ruleSpecs.map(r => parseRuleSpec(dimensions, r));
      const expression = evaluate(rules);

      console.log('Before simplification:');
      console.log(expression.format());
      console.log();

      const simplified = simplify(dimensionList, expression);

      console.log('After simplification:');
      console.log(simplified.format());
      console.log();

      // TODO: this test is brittle because the algorithm could get the right
      // answer in a different order.
      const expected =
        'source port: 3\ndestination port: 200\n\nsource port: 1-2\ndestination port: 100';
      const observed = simplified.format();
      assert.equal(observed, expected);
    });

    it('(a+b)(c+d)', () => {
      const ruleSpecs1 = [
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          destPort: '101',
        },
      ];

      const ruleSpecs2 = [
        {
          action: ActionType.ALLOW,
          priority: 1,
          destPort: '101',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '2',
        },
      ];

      const rules1 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
      const rules2 = ruleSpecs2.map(r => parseRuleSpec(dimensions, r));
      const expression1 = evaluate(rules1);
      const expression2 = evaluate(rules2);
      const expression = expression1.intersect(expression2);

      console.log('Before simplification:');
      console.log(expression.format());
      console.log();

      const simplified = simplify(dimensionList, expression);

      console.log('After simplification:');
      console.log(simplified.format());
      console.log();

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
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          destPort: '101',
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
      const rules1 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
      // const rules2 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
      const expression1 = evaluate(rules1);
      // const expression2 = evaluate(rules2);
      const expression = expression1.intersect(expression1);

      // Similar code does not cause exception:
      // const rules1 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
      // const expression1 = evaluate(rules1);
      // const expression = expression1.intersect(expression1);

      console.log('Before simplification:');
      console.log(expression.format());
      console.log();

      const simplified = simplify(dimensionList, expression);

      console.log('After simplification:');
      console.log(simplified.format());
      console.log();

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
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1',
          destPort: '100',
          protocol: 'TCP',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '2',
          destPort: '100',
          protocol: 'TCP',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1-2',
          destPort: '101',
          protocol: 'TCP',
        },
        {
          action: ActionType.ALLOW,
          priority: 1,
          sourcePort: '1-2',
          destPort: '100-101',
          protocol: 'UDP',
        },
      ];

      const rules = ruleSpecs.map(r => parseRuleSpec(dimensions, r));
      const expression = evaluate(rules);

      console.log('Before simplification:');
      console.log(expression.format());
      console.log();

      const simplified = simplify(dimensionList, expression);

      console.log('After simplification:');
      console.log(simplified.format());
      console.log();

      // TODO: this test is brittle because the algorithm could get the right
      // answer in a different order.
      const expected =
        'source port: 1-2\ndestination port: 100-101\nprotocol: TCP, UDP';
      const observed = simplified.format();
      assert.equal(observed, expected);
    });
  });
});
