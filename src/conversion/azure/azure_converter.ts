import {ForwardRuleSpec, NodeSpec, SymbolStore} from '../../graph';

import {
  AnyAzureObject,
  ConverterStore,
  EntityStore,
  INodeSpecUniverse,
  LocalIpConverter,
  NetworkInterfaceConverter,
  PublicIpConverter,
  SubnetConverter,
  VirtualNetworkConverter,
} from '..';

class AzureConverterImpl {
  private readonly converters: ConverterStore<AnyAzureObject>;

  // TODO: Think of better name for EntityStore
  // TODO: What happens to EntityStore if we move away from using
  // aliases and monikers?
  private readonly entityStore: EntityStore;
  private readonly symbolStore: SymbolStore;
  private readonly vnetConverter: VirtualNetworkConverter;

  constructor() {
    this.entityStore = new EntityStore();

    this.symbolStore = new SymbolStore(
      {
        dimension: 'ip',
        symbol: 'AzureLoadBalancer',
        range: '168.63.129.16',
      },
      {
        dimension: 'protocol',
        symbol: 'Tcp',
        range: 'tcp',
      }
    );

    this.vnetConverter = new VirtualNetworkConverter(this.symbolStore);
    this.converters = ConverterStore.create<AnyAzureObject>(
      this.vnetConverter,
      NetworkInterfaceConverter,
      PublicIpConverter,
      LocalIpConverter,
      SubnetConverter
    );
  }

  public convert(root: IterableIterator<AnyAzureObject>): INodeSpecUniverse {
    const KEY_INTERNET = 'Internet';
    const itemsToMap: AnyAzureObject[] = [];
    const nodes: NodeSpec[] = [];

    //
    // Step 1: index AzureObjects and sub-objects by alias/moniker.
    // IAzureConverter.monikers knows how to find and name sub-objects
    // like AzureSubnets and AzureIPConfiguration.
    //

    for (const item of root) {
      const converter = this.converters.asConverter(item);

      itemsToMap.push(item);

      for (const index of converter.monikers(item)) {
        if (index.item) {
          this.entityStore.registerEntity(index.item, index.name);
        }
      }
    }

    //
    // Step 2: convert all AzureObjects to NodeSpecs.
    //

    // [...root]?
    for (const item of itemsToMap) {
      const converter = this.converters.asConverter(item);
      nodes.push(...converter.convert(item, this.entityStore));
    }

    //
    // Step 3: define KEY_INTERNET service tag referenced by generated
    // NodeSpecs.
    //

    const range = this.vnetConverter.virtualNetworks().join(',');
    const internet = `except ${range}`;
    this.symbolStore.pushHead('ip', KEY_INTERNET, internet);

    const vnetRules: ForwardRuleSpec[] = [];
    for (const vnet of this.vnetConverter.virtualNetworks()) {
      vnetRules.push({
        destination: vnet,
        destinationIp: vnet,
      });
    }

    // This will be hooked up differently when we get PublicIp working.
    nodes.push({
      // You are using KEY_INTERNET in two different ways here. One is
      // for the node's key and the other is for a service tag. Also,
      // let's discuss the pros/cons of defining service tags for nodes.
      key: KEY_INTERNET,
      endpoint: true,
      range: {
        sourceIp: KEY_INTERNET,
      },
      rules: vnetRules,
    });

    return {
      symbols: this.symbolStore.getSymbolsSpec(),
      nodes: nodes,
    };
  }
}

// Consider exposing this as a function, rather than an object.
export const AzureConverter = {
  convert(root: IterableIterator<AnyAzureObject>): INodeSpecUniverse {
    const converter = new AzureConverterImpl();
    return converter.convert(root);
  },
};
