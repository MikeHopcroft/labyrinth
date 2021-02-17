import {Universe} from '../dimensions';

import {
  denyOverrides,
  parseConjunction,
  parseRuleSpec,
  RuleSpec,
} from '../rules';

import {Conjunction, Disjunction, Simplifier} from '../setops';

import {ForwardRuleSpec} from './types';

export interface ForwardRule {
  conjunction: Conjunction<ForwardRuleSpec>;
  filters: Disjunction<RuleSpec>;
  destination: string;
}

export function parseForwardRuleSpec(
  universe: Universe,
  simplifier: Simplifier<RuleSpec>,
  spec: ForwardRuleSpec
): ForwardRule {
  // Want to ensure that `filters` is not a property of `rest`.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {destination, filters, ...rest} = spec;
  const conjunction = parseConjunction<ForwardRuleSpec>(universe, rest, spec);

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
