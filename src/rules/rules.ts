import fs from 'fs';
import yaml from 'js-yaml';

import {Universe} from '../dimensions';
import {Conjunction, Disjunction} from '../setops';
import {validate} from '../utilities';

import {ActionType, RuleSpec, ruleSpecSetType} from './types';

///////////////////////////////////////////////////////////////////////////////
//
// Rule
//
///////////////////////////////////////////////////////////////////////////////

export interface Rule {
  action: ActionType;
  priority: number;
  conjunction: Conjunction;
}

// TODO: Consider moving to Rule.constructor().
export function parseRuleSpec(universe: Universe, spec: RuleSpec): Rule {
  const {action, priority, ...rest} = spec;
  let conjunction = Conjunction.create([]);

  for (const key of Object.getOwnPropertyNames(rest)) {
    const dimension = universe.get(key);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (rest as any)[key];
    if (typeof value !== 'string') {
      const message = `${key}: expected a string value.`;
      throw new TypeError(message);
    }
    conjunction = conjunction.intersect(dimension.parse(value));
  }

  return {action, priority, conjunction};
}

export function loadRules(universe: Universe, file: string): Rule[] {
  console.log(`Load rules from "${file}".`);

  const text = fs.readFileSync(file, 'utf8');
  const root = yaml.safeLoad(text);
  const spec = validate(ruleSpecSetType, root);
  const rules = spec.rules.map(r => parseRuleSpec(universe, r));
  return rules;
}

///////////////////////////////////////////////////////////////////////////////
//
// Rule set evaluation.
//
///////////////////////////////////////////////////////////////////////////////

interface RuleGroup {
  priority: number;
  allow: Rule[];
  deny: Rule[];
}

export function evaluate(rules: Rule[]): Disjunction {
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
    } else {
      groups[groups.length - 1].deny.push(r);
    }
  }

  // Default to empty set.
  let expression: Disjunction = Disjunction.create([]);

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
