import {Dimension} from '../dimensions';
import {Evaluator} from '../loaders';
import {RuleSpec, simplify} from '../setops';

import {Rule} from './rule';

export function detectRedundantRules(
  dimensions: Dimension[],
  evaluator: Evaluator,
  rules: Rule[]
): RuleSpec[] {
  const redundant: RuleSpec[] = [];

  const baseline = simplify(dimensions, evaluator(dimensions, rules));
  for (let i = 0; i < rules.length; ++i) {
    const filtered = rules.filter((rule, index) => index !== i);
    // console.log(`Checking ${filtered.map(x => x.spec.id)}`);
    const other = simplify(dimensions, evaluator(dimensions, filtered));

    const baselineSubOther = simplify(
      dimensions,
      baseline.subtract(other)
    );
    if (!baselineSubOther.isEmpty()) {
      continue;
    }

    const otherSubBaseline = simplify(
      dimensions,
      other.subtract(baseline)
    );
    if (otherSubBaseline.isEmpty()) {
      redundant.push(rules[i].spec);
    }
  }

  return redundant;
}
