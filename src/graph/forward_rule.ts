import {Universe} from '../dimensions';

import {
  denyOverrides,
  parseConjunction,
  parseRuleSpec,
  RuleSpec,
} from '../rules';

import {Conjunction, Disjunction, Simplifier} from '../setops';

import {ForwardRuleSpecEx} from './types';

export interface ForwardRule {
  destination: string;
  conjunction: Conjunction<ForwardRuleSpecEx>;
  override?: Conjunction<ForwardRuleSpecEx>;
  filters: Disjunction<RuleSpec>;
}

export function parseForwardRuleSpec(
  universe: Universe,
  simplifier: Simplifier<RuleSpec>,
  spec: ForwardRuleSpecEx
): ForwardRule {
  // Want to ensure that `filters` is not a property of `rest`.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {destination, filters, override, ...rest} = spec;
  const conjunction = parseConjunction<ForwardRuleSpecEx>(universe, rest, spec);

  const overrideConjunction = spec.override
    ? parseConjunction<ForwardRuleSpecEx>(universe, spec.override, spec)
    : spec.override;

  let filtersDisjunction: Disjunction<RuleSpec>;
  if (spec.filters) {
    const rules = spec.filters.map(r => {
      // TODO: sort out correct `id` and `source`.
      return parseRuleSpec(universe, {...r, id: 1, source: 'source'});
    });

    filtersDisjunction = denyOverrides(
      rules,
      simplifier as Simplifier<RuleSpec>
    );
  } else {
    // TODO: sort out RuleSpec vs RuleSpecEx
    filtersDisjunction = Disjunction.universe<RuleSpec>();
  }

  if (overrideConjunction) {
    return {
      conjunction,
      destination,
      filters: filtersDisjunction,
      override: overrideConjunction,
    };
  } else {
    return {conjunction, destination, filters: filtersDisjunction};
  }
}
