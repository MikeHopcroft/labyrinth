import {RuleSpec} from '..';
import {NodeSpec, SymbolDefinitionSpec} from '../graph';

export interface IRules {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

export interface INodeSpecUniverse {
  symbols: SymbolDefinitionSpec[];
  nodes: NodeSpec[];
}

export interface IEntityStore<TBase> {
  getAlias(id: string): string;
  getEntity<T extends TBase>(id: string): T;
}
