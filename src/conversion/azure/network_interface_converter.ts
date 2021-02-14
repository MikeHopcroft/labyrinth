import {IEntityStore} from '..';
import {NodeSpec} from '../..';
import {
  AnyAzureObject,
  ConverterStore,
  AzureNetworkInterface,
  BaseAzureConverter,
  ItemAlias,
  LocalIpConverter,
  PublicIpConverter,
} from '.';

export class NetworkInterfaceConverter extends BaseAzureConverter {
  private readonly ipConverters: ConverterStore;

  constructor() {
    super('microsoft.network/networkinterfaces');
    this.ipConverters = new ConverterStore(
      new LocalIpConverter(),
      new PublicIpConverter()
    );
  }

  aliases(input: AnyAzureObject): ItemAlias[] {
    const aliases = super.aliases(input);
    const nic = input as AzureNetworkInterface;

    for (const config of nic.properties.ipConfigurations) {
      const converter = this.ipConverters.asConverter(config);

      if (converter) {
        for (const alias of converter.aliases(config)) {
          aliases.push({
            item: alias.item,
            alias: `${nic.name}/${alias.alias}`,
          });
        }
      }
    }

    return aliases;
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
