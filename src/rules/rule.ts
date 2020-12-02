import {Conjunction} from '../setops';

import {ActionType} from './ruleSpec';

export interface Rule {
  action: ActionType;
  priority: number;
  conjunction: Conjunction;
}
