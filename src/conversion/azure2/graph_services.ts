import {GraphSpec, NodeSpec} from '../../graph';
import {IRules} from '../types';
import {convertNsg} from './convert_network_security_group';

import {SymbolTable} from './symbol_table';

import {
  AnyAzureObject,
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureReference,
  AzureResourceGraph,
  AzureSubnet,
  AzureVirtualNetwork,
} from './types';

import {walk} from './walk';

// DESIGN ALTERNATIVE (for converter return value):
// Instead of returning identifier that is both the node key and
// the service tag, return an object
//   {
//     inboundKey: string,
//     outboundKey: string,
//     range: DRange or string expression?
//   }
export interface IConverters {
  resourceGraph(services: GraphServices, spec: AzureResourceGraph): void;
  subnet(services: GraphServices, spec: AzureSubnet, parent: string): string;
  vnet(services: GraphServices, spec: AzureVirtualNetwork): string;
  ip(services: GraphServices, spec: AzureIPConfiguration): string;
  nsg(
    services: GraphServices,
    spect: AzureNetworkSecurityGroup,
    vnetSymbol: string
  ): IRules;
}

const defaultConverterMocks: IConverters = {
  resourceGraph: (builder: GraphServices, spec: AzureResourceGraph) => {},
  subnet: (builder: GraphServices, spec: AzureSubnet, vNetKey: string) =>
    `${spec.id}/${vNetKey}`,
  vnet: (builder: GraphServices, spec: AzureVirtualNetwork) => spec.id,
  ip: (services: GraphServices, ip: AzureIPConfiguration) => {
    return ip.id;
  },
  nsg: convertNsg,
};

export function overrideDefaultCoverterMocks(overrides: Partial<IConverters>) {
  return {...defaultConverterMocks, ...overrides};
}

export class GraphServices {
  private readonly idToAzureObject = new Map<string, AnyAzureObject>();
  readonly convert: IConverters;
  private readonly nodes: NodeSpec[] = [];
  readonly symbols: SymbolTable;

  constructor(
    converters: IConverters,
    symbols: SymbolTable,
    resourceGraph: AnyAzureObject[]
  ) {
    this.convert = converters;
    this.symbols = symbols;
    for (const item of walk(resourceGraph)) {
      this.idToAzureObject.set(item.id, item as AnyAzureObject);
    }
  }

  // Add a Labyrinth node to the generated graph.
  addNode(node: NodeSpec) {
    this.nodes.push(node);
  }

  hasItem(id: string): boolean {
    return this.idToAzureObject.has(id);
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
    return {nodes: this.nodes, symbols: this.symbols.getSymbolSpec()};
  }

  // TODO: eventually we will probably need some scope management
  // around the internet key, since it will be a different symbol,
  // depending on VNet context.
  getInternetKey() {
    return 'Internet';
  }
}
