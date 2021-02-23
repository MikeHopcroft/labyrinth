import {RuleSpec} from '..';
import {NodeSpec, SymbolDefinitionSpec} from '../graph';

export interface IRules {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

// Can we come up with a better name?
export interface INodeSpecUniverse {
  symbols: SymbolDefinitionSpec[];
  nodes: NodeSpec[];
}

export interface IEntityStore<TBase> {
  getAlias(id: string): string;
  getEntity<T extends TBase>(id: string): T;
}
