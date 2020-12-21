import {ActionType, Disjunction, RuleSpec, Simplifier} from '../setops';

import {nopSimplifier} from './create_simplifier';
import {Rule} from './rule';

interface RuleGroup {
  priority: number;
  allow: Rule[];
  deny: Rule[];
}

export function denyOverrides(
  rules: Rule[],
  simplify: Simplifier<RuleSpec> = nopSimplifier
): Disjunction<RuleSpec> {
  // Sort rules by ascending priority.
  const sorted = [...rules].sort((a: Rule, b: Rule) => {
    return a.priority - b.priority;
  });

  // Group rules by priority and allow/deny status.
  const groups: RuleGroup[] = [];
  for (const r of sorted) {
    if (
      groups.length === 0 ||
      groups[groups.length - 1].priority !== r.priority
    ) {
      groups.push({priority: r.priority, allow: [], deny: []});
    }
    if (r.action === ActionType.ALLOW) {
      groups[groups.length - 1].allow.push(r);
    } else if (r.action === ActionType.DENY) {
      groups[groups.length - 1].deny.push(r);
    } else {
      const message = `Illegal action: ${r.action}.`;
      throw new TypeError(message);
    }
  }

  // Default to empty set.
  let expression = Disjunction.create<RuleSpec>([]);

  for (const g of groups) {
    for (const r of g.allow) {
      const e = Disjunction.create([r.conjunction]);
      // TODO: convenience method to intersect Disjunction with Conjunction.
      expression = simplify(expression.union(e));
    }

    // TODO: REVIEW: not sure this is correct.
    // Do we need to apply De Morgan's to the entire conjunction?
    for (const r of g.deny) {
      const e = simplify(r.conjunction.complement());
      expression = simplify(expression.intersect(e));
    }
  }

  return expression;
}
