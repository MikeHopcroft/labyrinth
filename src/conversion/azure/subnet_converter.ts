import * as path from 'path';
import {ForwardRuleSpecEx, NodeSpec} from '../../graph';
import {
  AnyAzureObject,
  ConverterStore,
  AzureIPConfiguration,
  AzureSubnet,
  BaseAzureConverter,
  LocalIpConverter,
  NetworkSecurtiyGroupConverter,
  PublicIpConverter,
} from '.';
import {AzureNetworkSecurityGroup, AzureVirtualNetwork} from './schema';
import {IEntityStore, ItemAlias} from '..';

export class SubnetConverter extends BaseAzureConverter {
  private readonly conveters: ConverterStore;
  private readonly nsgConverter: NetworkSecurtiyGroupConverter;

  constructor() {
    super('Microsoft.Network/virtualNetworks/subnets');
    this.conveters = new ConverterStore(
      new PublicIpConverter(),
      new LocalIpConverter()
    );
    this.nsgConverter = new NetworkSecurtiyGroupConverter();
  }

  public static getVnetId(id: string): string {
    return path.dirname(path.dirname(id));
  }

  aliases(input: AnyAzureObject): ItemAlias[] {
    const aliases: ItemAlias[] = [];
    aliases.push({
      item: input,
      alias: `${input.name}/router`,
    });
    return aliases;
  }

  convert(
    input: AnyAzureObject,
    store: IEntityStore<AnyAzureObject>
  ): NodeSpec[] {
    const subnet = input as AzureSubnet;
    const vnet = store.getEntity(
      SubnetConverter.getVnetId(subnet.id)
    ) as AzureVirtualNetwork;
    const alias = subnet.name;
    const nodes: NodeSpec[] = [];

    // TODO: come up with safer naming scheme. Want to avoid collisions
    // with other names.
    const inboundKey = alias + '/inbound';
    const outboundKey = alias + '/outbound';
    const routerKey = alias + '/router';

    const rules: ForwardRuleSpecEx[] = [
      // Traffice leaving subnet
      {
        destination: outboundKey,
        destinationIp: `except ${subnet.properties.addressPrefix}`,
      },
    ];

    if (subnet.properties.ipConfigurations) {
      for (const ip of subnet.properties.ipConfigurations) {
        const ipConfig = store.getEntity<AzureIPConfiguration>(ip.id);
        const converter = this.conveters.asConverter(ipConfig);

        if (converter) {
          const ipNodes = converter.convert(ipConfig, store);

          for (const ipNode of ipNodes) {
            if (ipNode) {
              ipNode.rules.push({
                destination: routerKey,
              });
              //nodes.push(ipNode);
              if (ipNode.range) {
                // Traffic to child of subnet
                rules.push({
                  destination: store.getAlias(ipConfig.id),
                  destinationIp: ipNode.range.sourceIp,
                });
              }
            }
          }
        }
      }
    }

    const routerNode: NodeSpec = {
      key: routerKey,
      range: {
        sourceIp: subnet.properties.addressPrefix,
      },
      rules,
    };
    nodes.push(routerNode);

    if (subnet.properties.networkSecurityGroup) {
      const nsg = store.getEntity(
        subnet.properties.networkSecurityGroup.id
      ) as AzureNetworkSecurityGroup;

      const nsgRules = this.nsgConverter.rules(nsg, vnet);

      const inboundNode: NodeSpec = {
        key: inboundKey,
        filters: nsgRules.inboundRules,
        // NOTE: no range because inbound can receive from any sourceIp
        // TODO: is this correct? The router moves packets in both directions.
        rules: [
          {
            destination: routerKey,
          },
        ],
      };
      nodes.push(inboundNode);

      const outboundNode: NodeSpec = {
        key: outboundKey,
        filters: nsgRules.outboundRules,
        range: {
          sourceIp: subnet.properties.addressPrefix,
        },
        rules: [],
      };
      nodes.push(outboundNode);
    }

    return nodes;
  }
}
