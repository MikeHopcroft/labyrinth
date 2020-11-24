import {Conjunction, Disjunction} from '../setops';

import {protocolToDRange} from './lookup_protocol';

import {
  createParserDEPRECATED,
  parseIpOrSymbol2,
  parseNumberOrSymbol2,
} from './parser';

import {ActionType, Rule, RuleDimensions, RuleSpec} from './types';


export function parseRuleSpec(
  dimensions: RuleDimensions,
  rule: RuleSpec
): Rule {
  let conjunction = Conjunction.create([]);

  // Source rules
  if (rule.sourceIp) {
    conjunction = conjunction.intersect(
      parseIpSet(dimensions.sourceIp, rule.sourceIp)
    );
  }
  if (rule.sourcePort) {
    conjunction = conjunction.intersect(
      parsePortSet(dimensions.sourcePort, rule.sourcePort)
    );
  }

  // Destination rules
  if (rule.destIp) {
    conjunction = conjunction.intersect(
      parseIpSet(dimensions.destIp, rule.destIp)
    );
  }
  if (rule.destPort) {
    conjunction = conjunction.intersect(
      parsePortSet(dimensions.destPort, rule.destPort)
    );
  }

  // Protocol rules
  if (rule.protocol) {
    conjunction = conjunction.intersect(
      parseProtocolSet(dimensions.protocol, rule.protocol)
    );
  }

  const {action, priority} = rule;
  return {action, priority, conjunction};
}

export const parseIpSet = createParserDEPRECATED(
  parseIpOrSymbol2,
  symbolToUndefined
);

export const parseProtocolSet = createParserDEPRECATED(
  parseNumberOrSymbol2,
  (text: string) => protocolToDRange.get(text)
);

export const parsePortSet = createParserDEPRECATED(
  parseNumberOrSymbol2,
  symbolToUndefined
);

function symbolToUndefined(symbol: string) {
  return undefined;
}

///////////////////////////////////////////////////////////////////////////////
//
//
//
///////////////////////////////////////////////////////////////////////////////

interface RuleGroup {
  priority: number;
  allow: Rule[];
  deny: Rule[];
}

export function evaluate(rules: Rule[]): Disjunction {
  // Sort rules by priority ascending
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

  // Default first rule allows all.
  // Should this deny all instead?
  // let expression: Disjunction = Disjunction.create([Conjunction.create([])]);

  // Default to empty set.
  let expression: Disjunction = Disjunction.create([]);

  for (const g of groups) {
    for (const r of g.allow) {
      const e = Disjunction.create([r.conjunction]);
      // TODO: convenience method to intersect Disjunction with Conjunction.
      expression = expression.union(e);
    }

    // TODO: REVIEW: not sure this is correct.
    // Do we need to apply De Morgan to the entire conjunction?
    for (const r of g.deny) {
      const e = r.conjunction.complement();
      expression = expression.intersect(e);
    }
  }

  return expression;
}
