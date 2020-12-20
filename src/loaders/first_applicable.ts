import {Dimension} from '../dimensions';
import {ActionType, Disjunction, simplify} from '../setops';

import {Rule} from './rule';

export function firstApplicable(dimensions: Dimension[], rules: Rule[]): Disjunction {
  return buildExpression(0, dimensions, rules);
}

function buildExpression(
  index: number,
  dimensions: Dimension[],
  rules: Rule[]
): Disjunction {
  if (index === rules.length) {
    return Disjunction.create([]);
  } else {
    const rest = buildExpression(index + 1, dimensions, rules);
    const r = rules[index];
    if (r.action === ActionType.DENY) {
      return r.conjunction.complement().intersect(rest);
    } else if (r.action === ActionType.ALLOW) {
      // return Disjunction.create([r.conjunction]).union(rest);
      return simplify(dimensions, Disjunction.create([r.conjunction]).union(rest));
    } else {
      const message = `Illegal action: ${r.action}.`;
      throw new TypeError(message);
    }
  }
}
