import {Universe} from '../dimensions';
import {parseConjunction} from '../rules';
import {Conjunction} from '../setops';

import {PoolRuleSpec} from './types';

export interface PoolRule {
  destination: string;
  override: Conjunction<PoolRuleSpec>;
}

export function parsePoolRuleSpec(
  universe: Universe,
  spec: PoolRuleSpec
): PoolRule {
  const {destination, override} = spec;
  const overrideConjunction = parseConjunction<PoolRuleSpec>(
    universe,
    override,
    spec
  );

  return {
    destination,
    override: overrideConjunction,
  };
}
