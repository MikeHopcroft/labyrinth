import DRange from 'drange';

import {Universe} from '../dimensions';
import {ActionType, RuleSpec, RuleSpecSet} from '../rules';

import {Random} from './random';

export function createRandomPolicy(
  universe: Universe,
  ruleCount: number,
  p: number,
  random: Random
): RuleSpecSet {
  const rules: RuleSpec[] = [];
  for (let i = 0; i < ruleCount; ++i) {
    const rule = createRandomRuleSpec(universe, random, p);
    rule.priority = 1;
    rules.push(rule);
  }
  return {rules};
}

export function createRandomRuleSpec(
  universe: Universe,
  random: Random,
  p: number
): RuleSpec {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spec: {[others: string]: any} = {};

  const action = random.randomBoolean() ? ActionType.ALLOW : ActionType.DENY;

  const dimensions = [...universe.dimensions];
  while (dimensions.length > 0) {
    // Remove random dimension.
    const i = random.randomInRange(0, dimensions.length);
    const d = dimensions[i];
    dimensions[i] = dimensions[dimensions.length - 1];
    dimensions.pop();

    // Compute random value or range on dimension
    const domain = d.type.domain.subranges()[0];
    const start = random.randomInRange(domain.low, domain.high + 1);
    const end = random.randomInRange(start, domain.high + 1);
    const range = new DRange(start, end);

    // Format with dimension formatter
    const text = d.type.formatter(range);

    // Add to rule
    spec[d.key] = text;

    // Check to see if we continue
    if (!random.randomBoolean(p)) {
      break;
    }
  }

  return {
    action,
    priority: 1,
    id: 1,
    source: '1',
    ...spec,
  };
}

// export function createRandomIpAddress(random: Random): string {
//   const address = random.randomNonNegative(0xffffffff);
//   return ip.fromLong(address);
// }

// export function createRandomIpCIDR(random: Random): string {
//   const address = ip.fromLong(random.randomNonNegative(0xffffffff));
//   const bits = random.randomInRange(1,31);
//   const cidr = ip.cidrSubnet(`${address}/${bits}`);
//   return `${cidr.firstAddress}/${cidr.subnetMaskLength}`;
// }

// export function createRandomIpRange(random: Random): string {
//   const start = random.randomNonNegative(0xfffffffe);
//   const end = random.randomInRange(start + 1, 0xffffffff);
//   return `${ip.fromLong(start)}-${ip.fromLong(end)}`;
// }
