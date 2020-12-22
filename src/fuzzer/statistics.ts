import {Universe} from '../dimensions';
import {ActionType, RuleSpec} from '../rules';
import {Disjunction} from '../setops';

export function policyStatistics(
  universe: Universe,
  policy: RuleSpec[]
): string {
  const lines: string[] = [];

  const allow = universe.dimensions.map(() => 0);
  const deny = universe.dimensions.map(() => 0);

  for (const spec of policy) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {action, id, priority, source, ...rest} = spec;
    const count = Object.getOwnPropertyNames(rest).length;
    if (action === ActionType.ALLOW) {
      allow[count - 1]++;
    } else {
      deny[count - 1]++;
    }
  }

  const totalAllow = allow.reduce((acc, cur) => acc + cur);
  const totalDeny = deny.reduce((acc, cur) => acc + cur);
  const total = totalAllow + totalDeny;

  lines.push(`Total rules: ${total}`);
  lines.push(`Allow rules: ${totalAllow}`);
  for (const [i, v] of allow.entries()) {
    lines.push(`  ${i + 1}: ${v}`);
  }
  lines.push(`Deny rules: ${totalDeny}`);
  for (const [i, v] of deny.entries()) {
    lines.push(`  ${i + 1}: ${v}`);
  }

  return lines.join('\n');
}

export function expressionStatistics(
  universe: Universe,
  expression: Disjunction<RuleSpec>
): string {
  const lines: string[] = [];

  const histogram = universe.dimensions.map(() => 0);

  for (const c of expression.conjunctions) {
    const count = c.dimensions.length;
    histogram[count - 1]++;
  }

  lines.push(`Total conjunctions: ${expression.conjunctions.length}`);
  lines.push('Dimension count histogram:');
  for (const [i, v] of histogram.entries()) {
    lines.push(`  ${i + 1}: ${v}`);
  }

  return lines.join('\n');
}
