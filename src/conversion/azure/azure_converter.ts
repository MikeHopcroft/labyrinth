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

    for (const item of root) {
      const converter = this.converters.asConverter(item);

      itemsToMap.push(item);

      for (const index of converter.monikers(item)) {
        if (index.item) {
          this.entityStore.registerEntity(index.item, index.name);
        }
      }
    }

    for (const item of itemsToMap) {
      const converter = this.converters.asConverter(item);
      nodes.push(...converter.convert(item, this.entityStore));
    }

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

    nodes.push({
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

export const AzureConverter = {
  convert(root: IterableIterator<AnyAzureObject>): INodeSpecUniverse {
    const converter = new AzureConverterImpl();
    return converter.convert(root);
  },
};
