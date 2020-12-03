import {Universe} from '../dimensions';
import {Disjunction, RuleSpec, simplify} from '../setops';

import {Rule} from './rule';

export type Evaluator = (rules: Rule[]) => Disjunction;

export function detectRedundantRules(
  universe: Universe,
  evaluator: Evaluator,
  rules: Rule[]
): RuleSpec[]
{
  const redundant: RuleSpec[] = [];

  const baseline = simplify(universe.dimensions, evaluator(rules));
  for (let i = 0; i < rules.length; ++i) {
    const filtered = rules.filter((rule,index) => index !== i);
    // console.log(`Checking ${filtered.map(x => x.spec.id)}`);
    const other = simplify(universe.dimensions, evaluator(filtered));

    const baselineSubOther = simplify(
      universe.dimensions,
      baseline.subtract(other)
    );
    if (!baselineSubOther.isEmpty()) {
      continue;
    }

    const otherSubBaseline = simplify(
      universe.dimensions,
      other.subtract(baseline)
    );
    if (otherSubBaseline.isEmpty()) {
      redundant.push(rules[i].spec);
    }
  }

  return redundant;
}