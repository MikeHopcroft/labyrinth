import {IEntityStore} from '..';
import {NodeSpec} from '../..';
import {
  AnyAzureObject,
  ConverterStore,
  AzureNetworkInterface,
  BaseAzureConverter,
  ItemMoniker,
  LocalIpConverter,
  PublicIpConverter,
} from '.';

export class NetworkInterfaceConverter extends BaseAzureConverter {
  private readonly ipConverters: ConverterStore;

  constructor() {
    super('microsoft.network/networkinterfaces');
    this.ipConverters = ConverterStore.create(
      new LocalIpConverter(),
      new PublicIpConverter()
    );
  }

  monikers(input: AnyAzureObject): ItemMoniker[] {
    const monikers = super.monikers(input);
    const nic = input as AzureNetworkInterface;

    for (const config of nic.properties.ipConfigurations) {
      const converter = this.ipConverters.asConverter(config);

      if (converter) {
        for (const alias of converter.monikers(config)) {
          monikers.push({
            item: alias.item,
            alias: `${nic.name}/${alias.alias}`,
          });
        }
      }
    }

    return monikers;
  }

  convert(
    input: AnyAzureObject,
    store: IEntityStore<AnyAzureObject>
  ): NodeSpec[] {
    const nodes: NodeSpec[] = [];
    const nic = input as AzureNetworkInterface;

    for (const config of nic.properties.ipConfigurations) {
      const converter = this.ipConverters.asConverter(config);

      if (converter) {
        for (const ipNodes of converter.convert(config, store)) {
          nodes.push(ipNodes);
        }
      }
    }
    return nodes;
  }
}
