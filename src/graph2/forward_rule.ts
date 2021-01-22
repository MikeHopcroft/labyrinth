import {Universe} from '../dimensions';
import {parseConjunction} from '../rules';
import {Conjunction} from '../setops';

import {ForwardRuleSpecEx} from './types';

///////////////////////////////////////////////////////////////////////////////
//
//
//
///////////////////////////////////////////////////////////////////////////////
export interface ForwardRule {
  conjunction: Conjunction<ForwardRuleSpecEx>;
  destination: string;
}

export function parseForwardRuleSpec(
  universe: Universe,
  spec: ForwardRuleSpecEx
): ForwardRule {
  const {destination, ...rest} = spec;
  const conjunction = parseConjunction<ForwardRuleSpecEx>(universe, rest, spec);
  return {conjunction, destination};
}
