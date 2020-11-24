import {Dimension, DimensionType, simplify} from '../setops';

import {
  ActionType,
  createFormatter,
  createNumberSymbolFormatter,
  createIpFormatter,
  evaluate,
  parseRuleSpec,
  RuleDimensions,
  RuleSpec,
} from '../rules';

const ipFormatter = createFormatter(
  createIpFormatter(new Map<string, string>())
);

const portFormatter = createFormatter(
  createNumberSymbolFormatter(new Map<string, string>())
);

const protocolFormatter = createFormatter(
  createNumberSymbolFormatter(
    new Map<string, string>([
      ['1', 'ICMPxx'],
      ['6', 'TCPxx'],
      ['17', 'UDPxx'],
    ])
  )
);

const ipType = new DimensionType({
  name: 'ip address',
  key: 'ip',
  parser: 'ip',
  formatter: 'ip',
  domain: '0.0.0.0-255.255.255.255',
  values: []
})

const sourceIp = Dimension.create('source ip', ipType);

const portType = new DimensionType({
  name: 'port',
  key: 'port',
  parser: 'default',
  formatter: 'default',
  domain: '00-0xffff',
  values: []
})

const sourcePort = Dimension.create('source port', portType);

const destIp = Dimension.create('destination ip', ipType);

const destPort = Dimension.create('destination port', portType);

const protocolType = new DimensionType({
  name: 'protocol',
  key: 'protocol',
  parser: 'default',
  formatter: 'default',
  domain: '00-0xff',
  values: []
});

const protocol = Dimension.create('protocol', protocolType);

const dimensions: RuleDimensions = {
  sourceIp,
  sourcePort,
  destIp,
  destPort,
  protocol,
};

const dimensionList: Dimension[] = [
  sourceIp,
  sourcePort,
  destIp,
  destPort,
  protocol,
];

function go() {
  const ruleSpecs1: RuleSpec[] = [
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP,UDP',
    },
    {
      action: ActionType.DENY,
      priority: 10,
      destIp: '10.10.10.0/24',
      destPort: '81',
      sourcePort: '80-83',
    },
  ];

  const ruleSpecs2: RuleSpec[] = [
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
      destIp: '10.10.10.0/24',
      destPort: '81',
      sourcePort: '80',
    },
  ];
  const rules1 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
  const rules2 = ruleSpecs2.map(r => parseRuleSpec(dimensions, r));
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
