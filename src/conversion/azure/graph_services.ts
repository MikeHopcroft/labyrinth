import {GraphSpec, NodeSpec, RoutingRuleSpec} from '../../graph';

import {AzureObjectIndex} from './azure_object_index';
import {defaultConverters} from './default_converters';
import {IConverters} from './converters';
import {NodeServices} from './node_services';
import {SymbolTable} from './symbol_table';
import {AzureTypedObject} from './azure_types';
import {AddressAllocator} from './address_allocator';

export interface GraphServicesOptions {
  converters?: IConverters;
  nodes?: NodeServices;
  symbols?: SymbolTable;
  allocator?: AddressAllocator;
}

export class GraphServices {
  readonly index: AzureObjectIndex;
  readonly convert: IConverters;
  readonly nodes = new NodeServices();
  readonly symbols: SymbolTable;

  constructor(index: AzureObjectIndex, options: GraphServicesOptions = {}) {
    this.index = index;
    this.convert = options.converters ?? defaultConverters();
    this.nodes = options.nodes ?? new NodeServices();
    this.symbols = options.symbols ?? new SymbolTable([]);
  }

  getLabyrinthGraphSpec(): GraphSpec {
    return {
      nodes: [...this.nodes.nodes()].sort(this.sortByKey),
      symbols: this.symbols.getAllSymbolSpecs(),
    };
  }

  trackUnsupportedSpec(caller: string, spec: AzureTypedObject) {
    console.log(`Unsupported type '${spec.type}' used in '${caller}`);
  }

  createUnboundNicAndReturnRoute(): RoutingRuleSpec {
    const key = 'UnboundNetworkInterface';

    if (!this.nodes.get(key)) {
      this.nodes.add({
        key,
        routes: [],
      });
    }

    return {
      destination: key,
    };
  }

  createUnboundRuleAndReturnKey(): string {
    const key = 'UnboundRule';

    if (!this.nodes.get(key)) {
      this.nodes.add({
        key,
        routes: [],
      });
    }

    return key;
  }

  // TODO: eventually we will probably need some scope management
  // around the internet key, since it will be a different symbol,
  // depending on VNet context.
  getInternetKey() {
    return 'Internet';
  }

  private sortByKey(a: NodeSpec, b: NodeSpec) {
    return a.key.localeCompare(b.key);
  }
}
