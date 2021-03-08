import {NodeSpec, SymbolDefinitionSpec} from '../graph';
import {RuleSpec} from '../rules';

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

export interface IServiceTagFactory {
  defineServiceTag(tagName: string, range: string): void;
}

export interface IGraphServices extends IServiceTagFactory {
  getInternetKey(): string;
  addNode(node: NodeSpec): void;
}
