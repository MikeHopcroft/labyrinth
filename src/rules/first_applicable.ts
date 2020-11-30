import {Disjunction} from '../setops';

import {ActionType, Rule} from './types';

export function firstApplicable(
  rules: Rule[],
): Disjunction { 
  return buildExpression(0, rules);
}

function buildExpression(index: number, rules: Rule[]): Disjunction {
  if (index === rules.length) {
    return Disjunction.create([]);
  } else {
    const rest = buildExpression(index + 1, rules);
    const r = rules[index];
    if (r.action === ActionType.DENY) {
      return r.conjunction.complement().intersect(rest);
    } else if (r.action === ActionType.ALLOW) {
      return Disjunction.create([r.conjunction]).union(rest);
    } else {
      const message = `Illegal action: ${r.action}.`;
      throw new TypeError(message);
    }
  }
}
