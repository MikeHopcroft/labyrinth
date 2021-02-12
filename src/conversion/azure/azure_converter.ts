import {NodeSpec, SymbolStore} from '../../graph';
import {
  AnyAzureObject,
  ConverterStore,
  EntityStore,
  LocalIpConverter,
  NetworkInterfaceConverter,
  PublicIpConverter,
  SubnetConverter,
  VirtualNetworkConverter,
} from '.';
import {INodeSpecUniverse} from '../contracts';

export class AzureConverter {
  private readonly converters: ConverterStore;
  private readonly entityStore: EntityStore;
  private readonly symbolStore: SymbolStore;

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

    this.converters = new ConverterStore(
      new VirtualNetworkConverter(this.symbolStore),
      new NetworkInterfaceConverter(),
      new PublicIpConverter(),
      new LocalIpConverter(),
      new SubnetConverter()
    );
  }

  public Convert(root: AnyAzureObject[]): INodeSpecUniverse {
    const itemsToMap: AnyAzureObject[] = [];
    const nodes: NodeSpec[] = [];

    for (const item of root.values()) {
      const converter = this.converters.asConverter(item);

      if (converter) {
        itemsToMap.push(item);

        for (const index of converter.aliases(item)) {
          if (index.item) {
            this.entityStore.registerEntity(index.item, index.alias);
          }
        }
      }
    }

    for (const item of itemsToMap.values()) {
      const converter = this.converters.asConverter(item);

      if (converter) {
        for (const itemNode of converter.convert(item, this.entityStore)) {
          nodes.push(itemNode);
        }
      }
    }

    return {
      symbols: this.symbolStore.getSymbolsSpec(),
      nodes: nodes,
    };
  }
}
