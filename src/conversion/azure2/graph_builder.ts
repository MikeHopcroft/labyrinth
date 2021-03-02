import {GraphSpec, NodeSpec, SymbolDefinitionSpec} from '../../graph';

import {AnyAzureObject, AzureReference, AzureSubnet, AzureVirtualNetwork} from '../azure';

import {walk} from './walk';

export interface IConverters {
  vnet(builder: GraphBuilder, spec: AzureVirtualNetwork): string;
  subnet(builder: GraphBuilder, spec: AzureSubnet, parent: string): string;
}

const defaultConverterMocks: IConverters = {
  vnet: (builder: GraphBuilder, spec: AzureVirtualNetwork) => spec.id,
  subnet: (builder: GraphBuilder, spec: AzureSubnet, parent: string) =>
    `${spec.id}/${parent}`,
};

export function overrideDefaultCoverterMocks(overrides: Partial<IConverters>) {
  return {...defaultConverterMocks, ...overrides};
}

export class GraphBuilder {
  private readonly idToAzureObject = new Map<string, AnyAzureObject>();
  readonly convert: IConverters;
  private readonly nodes: NodeSpec[] = [];
  private readonly symbols: SymbolDefinitionSpec[];

  constructor(
    converters: IConverters,
    symbols: SymbolDefinitionSpec[],
    resourceGraph: AnyAzureObject[]
  ) {
    this.convert = converters;
    this.symbols = [...symbols];
    for (const item of walk(resourceGraph)) {
      this.idToAzureObject.set(item.id, item as AnyAzureObject);
    }
  }

  // Add a Labyrinth node to the generated graph.
  addNode(node: NodeSpec) {
    this.nodes.push(node);
  }

  // Looking an Azure item in the resource graph by its id.
  getItem(id: string): AnyAzureObject {
    const item = this.idToAzureObject.get(id);
    if (item === undefined) {
      const message = `Unknown Azure resource graph id "${id}"`;
      throw new TypeError(message);
    }
    return item;
  }

  // TODO: REVIEW: is it worth forgoing runtime type safety as this function
  // does, or should we insist on checks like asAzureVirtualNetwork()?
  // Also, do we wanta dereference() method that knows about AzureReferences
  // or should we just rely on the basic getItem()?
  dereference<T extends AnyAzureObject>(ref: AzureReference<T>) {
    return this.getItem(ref.id) as T;
  }

  getLabyrinthGraphSpec(): GraphSpec {
    return {nodes: this.nodes, symbols: this.symbols};
  }

  defineSymbol(
    dimension: string,
    symbol: string,
    range: string,
    insertAtHead = false
  ) {
    const spec: SymbolDefinitionSpec = {dimension, symbol, range};
    if (insertAtHead) {
      this.symbols.unshift(spec);
    } else {
      this.symbols.push(spec);
    }
  }
}
