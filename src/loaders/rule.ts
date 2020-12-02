import {Conjunction} from '../setops';

import {ActionType} from '../setops';

export interface Rule {
  action: ActionType;
  priority: number;
  conjunction: Conjunction;
}
