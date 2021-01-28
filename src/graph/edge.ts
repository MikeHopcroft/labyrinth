import {Disjunction} from '../setops';

import {ForwardRuleSpecEx} from './types';

export interface Edge {
  from: string;
  to: string;
  routes: Disjunction<ForwardRuleSpecEx>;
}
