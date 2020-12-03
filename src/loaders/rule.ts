import {Conjunction} from '../setops';

import {ActionType, RuleSpec} from '../setops';

export interface Rule {
  spec: RuleSpec;
  action: ActionType;
  priority: number;
  conjunction: Conjunction;
}
