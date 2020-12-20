import {Evaluator} from '../loaders';
import {RuleSpec, Simplifier} from '../setops';

import {nopSimplifier} from './create_simplifier';
import {Rule} from './rule';

export function detectRedundantRules(
  evaluator: Evaluator,
  rules: Rule[],
  simplify: Simplifier = nopSimplifier 
): RuleSpec[] {
  const redundant: RuleSpec[] = [];

  const baseline = evaluator(rules, simplify);
  for (let i = 0; i < rules.length; ++i) {
    const filtered = rules.filter((rule, index) => index !== i);
    // console.log(`Checking ${filtered.map(x => x.spec.id)}`);
    const other = evaluator(filtered, simplify);

    const baselineSubOther = baseline.subtract(other, simplify);
    if (!baselineSubOther.isEmpty()) {
      continue;
    }

    const otherSubBaseline = other.subtract(baseline, simplify);
    if (otherSubBaseline.isEmpty()) {
      redundant.push(rules[i].spec);
    }
  }

  return redundant;
}
