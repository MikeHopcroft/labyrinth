import {Conjunction, FormattingOptions} from '../setops';

import {ActionType, RuleSpec} from '../setops';

export interface Rule {
  spec: RuleSpec;
  action: ActionType;
  priority: number;
  conjunction: Conjunction<RuleSpec>;
}

export function formatRule(
  rule: Rule,
  options: FormattingOptions<RuleSpec> = {}
): string {
  const prefix = options.prefix || '';
  return `${prefix}action: ${rule.action}\n${prefix}priority: ${
    rule.priority
  }\n${prefix}${rule.conjunction.format(options)}\n`;
}
