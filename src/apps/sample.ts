import {Dimension} from '../dimensions';

import {
  ActionType,
  evaluate,
  parseRuleSpec2,
  RuleSpecEx,
  Universe,
  UniverseSpec
} from '../rules';

import {simplify} from '../setops';

const universeSpec: UniverseSpec = {
  types: [
    {
      name: 'ip address',
      key: 'ip',
      parser: 'ip',
      formatter: 'ip',
      domain: '0.0.0.0-255.255.255.255',
      values: []
    },
    {
      name: 'port',
      key: 'port',
      parser: 'default',
      formatter: 'default',
      domain: '00-0xffff',
      values: []
    },
    {
      name: 'protocol',
      key: 'protocol',
      parser: 'default',
      formatter: 'default',
      domain: '00-0xff',
      values: [
        { symbol: 'TCP', range: '6' },
        { symbol: 'UDP', range: '17' },
      ]
    }
  ],
  dimensions: [
    {
      name: 'source ip',
      key: 'sourceIp',
      type: 'ip'
    },
    {
      name: 'source port',
      key: 'sourcePort',
      type: 'port'
    },
    {
      name: 'destination ip',
      key: 'destinationIp',
      type: 'ip'
    },
    {
      name: 'destination port',
      key: 'destinationPort',
      type: 'port'
    },
    {
      name: 'protocol',
      key: 'protocol',
      type: 'protocol'
    },
  ]
};

function go() {
  const universe = new Universe(universeSpec);
  const dimensionList: Dimension[] = universe.dimensions;

  const ruleSpecs1: RuleSpecEx[] = [
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP,UDP',
    },
    {
      action: ActionType.DENY,
      priority: 10,
      destinationIp: '10.10.10.0/24',
      destinationPort: '81',
      sourcePort: '80-83',
    },
  ];

  const ruleSpecs2: RuleSpecEx[] = [
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP',
    },
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'UDP',
    },
    {
      action: ActionType.DENY,
      priority: 10,
      destinationIp: '10.10.10.0/24',
      destinationPort: '81',
      sourcePort: '80',
    },
  ];
  const rules1 = ruleSpecs1.map(r => parseRuleSpec2(universe, r));
  const rules2 = ruleSpecs2.map(r => parseRuleSpec2(universe, r));
  const r1 = evaluate(rules1);
  const r2 = evaluate(rules2);

  console.log('Allowed routes in r1:');
  console.log(r1.format('  '));
  console.log();

  const r1SubR2 = simplify(dimensionList, r1.subtract(r2));
  const r2SubR1 = simplify(dimensionList, r2.subtract(r1));

  if (r1SubR2.isEmpty() && r2SubR1.isEmpty()) {
    console.log('Rule sets r1 and r2 are equivalent');
  } else {
    if (r1SubR2.isEmpty()) {
      console.log('All routes in r1 are also in r2.');
    } else {
      console.log('Routes in r1 that are not in r2:');
      console.log(r1SubR2.format('  '));
    }
    console.log();

    if (r2SubR1.isEmpty()) {
      console.log('All routes in r2 are also in r1.');
    } else {
      console.log('Routes in r2 that are not in r1:');
      console.log(r2SubR1.format('  '));
    }
  }
  console.log();
}

go();
