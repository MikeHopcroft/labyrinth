import {Dimension} from '../setops';

import {ipFormatter, parseRuleSpec, portFormatter, protocolFormatter} from '../rules'
import { ActionType, RuleDimensions, RuleSpec, RuleSpecSet } from '../rules/types';
import { evaluate } from '../rules/rules';

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

const dimensions: RuleDimensions = {
  sourceIp,
  sourcePort,
  destIp,
  destPort,
  protocol
};

function go() {
  const ruleSpecs1: RuleSpec[] = [
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP,UDP'
    },
    {
      action: ActionType.DENY,
      priority: 1,
      destIp: '10.10.10.0/24',
      destPort: '81',
      sourcePort: '80-83'
    }
  ];
  const ruleSpecs2: RuleSpec[] = [
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'TCP'
    },
    {
      action: ActionType.ALLOW,
      priority: 1,
      sourceIp: '127.0.0.1',
      protocol: 'UDP'
    },
    {
      action: ActionType.DENY,
      priority: 1,
      destIp: '10.10.10.0/24',
      destPort: '81',
      sourcePort: '80'
    }
  ];
  const rules1 = ruleSpecs1.map(r => parseRuleSpec(dimensions, r));
  const rules2 = ruleSpecs2.map(r => parseRuleSpec(dimensions, r));
  const r1 = evaluate(rules1);
  const r2 = evaluate(rules2);
  // const result = r1.intersect(r2.)
  const result = r1;
  // TODO: need disjunction subtract, complement
  // TODO: need conjunction complement

  console.log('Allowed routes:');
  console.log(result.format());
}

go();
