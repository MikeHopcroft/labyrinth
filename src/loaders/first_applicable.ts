import {ActionType, Disjunction, Simplifier} from '../setops';

import {nopSimplifier} from './create_simplifier';
import {Rule} from './rule';

export function firstApplicable(
  rules: Rule[],
  simplify: Simplifier = nopSimplifier
): Disjunction {
  return buildExpression(0, rules, simplify);
}

function buildExpression(
  index: number,
  rules: Rule[],
  simplify: Simplifier
): Disjunction {
  if (index === rules.length) {
    return Disjunction.create([]);
  } else {
    const rest = buildExpression(index + 1, rules, simplify);
    const r = rules[index];
    if (r.action === ActionType.DENY) {
      return r.conjunction.complement().intersect(rest);
    } else if (r.action === ActionType.ALLOW) {
      return simplify(Disjunction.create([r.conjunction]).union(rest));
    } else {
      const message = `Illegal action: ${r.action}.`;
      throw new TypeError(message);
    }
  }
}
