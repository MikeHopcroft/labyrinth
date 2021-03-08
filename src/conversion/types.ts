import {RuleSpec} from '..';
import {NodeSpec, SymbolDefinitionSpec} from '../graph';

export interface NSGRuleSpecs {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

export interface NodeKeyAndSourceIp {
  key: string;
  destinationIp: string;
}

// TODO: What is a better name for this type?
export interface INodeSpecUniverse {
  symbols: SymbolDefinitionSpec[];
  nodes: NodeSpec[];
}

export interface IEntityStore<TBase> {
  getAlias(id: string): string;
  getEntity<T extends TBase>(id: string): T;
}
