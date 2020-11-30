import {Disjunction} from '../setops';

import {ActionType, Rule} from './types';

interface RuleGroup {
  priority: number;
  allow: Rule[];
  deny: Rule[];
}

export function denyOverrides(rules: Rule[]): Disjunction {
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
    } else if (r.action === ActionType.DENY){
      groups[groups.length - 1].deny.push(r);
    } else {
      const message = `Illegal action: ${r.action}.`;
      throw new TypeError(message);
    }
  }

  // Default to empty set.
  let expression = Disjunction.create([]);

  for (const g of groups) {
    for (const r of g.allow) {
      const e = Disjunction.create([r.conjunction]);
      // TODO: convenience method to intersect Disjunction with Conjunction.
      expression = expression.union(e);
    }

    // TODO: REVIEW: not sure this is correct.
    // Do we need to apply De Morgan's to the entire conjunction?
    for (const r of g.deny) {
      const e = r.conjunction.complement();
      expression = expression.intersect(e);
    }
  }

  return expression;
}
