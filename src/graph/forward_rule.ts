import {Universe} from '../dimensions';

import {
  denyOverrides,
  parseConjunction,
  parseRuleSpec,
  RuleSpec
} from '../rules';

import {Conjunction, Disjunction, Simplifier} from '../setops';

import {ForwardRuleSpecEx} from './types';

export interface ForwardRule {
  conjunction: Conjunction<ForwardRuleSpecEx>;
  filters: Disjunction<RuleSpec>,
  destination: string;
}

export function parseForwardRuleSpec(
  universe: Universe,
  simplifier: Simplifier<RuleSpec>,
  spec: ForwardRuleSpecEx
): ForwardRule {
  const {destination, filters, ...rest} = spec;
  const conjunction = parseConjunction<ForwardRuleSpecEx>(
    universe,
    rest,
    spec
  );

  let filters2: Disjunction<RuleSpec>;
  if (spec.filters) {
    const rules = spec.filters.map(r => {
      // TODO: sort out correct `id` and `source`.
      return parseRuleSpec(universe, {...r, id: 1, source: 'source'});
    });

    filters2 = denyOverrides(rules, simplifier as Simplifier<RuleSpec>);
  } else {
    // TODO: sort out RuleSpec vs RuleSpecEx
    filters2 = Disjunction.universe<RuleSpec>();
  }

  return {conjunction, destination, filters: filters2};
}
