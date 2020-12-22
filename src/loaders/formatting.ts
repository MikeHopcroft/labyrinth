import DRange from 'drange';

import {
  AttributionFormatter,
  FormatAttribution,
  FormattingOptions
} from '../setops';

import {RuleSpec} from './ruleSpec';

export function ruleSpecSetFormatter(style: FormatAttribution) {
  return formatRuleSpecSet;
  // TODO: evantually configure based on style. Something like
  // return (rules: Set<RuleSpec>, prefix: string) => {
  //   formatRules(rules, prefix, style)
  // }
}

// TODO: add support for FormatAttribution.RULE_ID.
export function formatRuleSpecSet(
  rules: Set<RuleSpec>,
  prefix = ''
): string[] {
  // First group specs by source.
  const sourceToSpecs = new Map<string, RuleSpec[]>();
  for (const spec of rules.values()) {
    const specs = sourceToSpecs.get(spec.source);
    if (specs === undefined) {
      sourceToSpecs.set(spec.source, [spec]);
    } else {
      specs.push(spec);
    }
  }

  // The format specs for each source.
  const lines: string[] = [];
  for (const [source, specs] of sourceToSpecs.entries()) {
    const ids = specs.map(x => x.id);
    const range = new DRange();
    ids.map(x => {
      range.add(x);
    });
    const idText = range.toString().slice(2, -2);
    lines.push(`${prefix}${source} rules: ${idText}`);
  }
  return lines;
}
