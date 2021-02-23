import * as path from 'path';

import {ForwardRuleSpec, NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {
  AnyAzureObject,
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureVirtualNetwork,
  IAzureConverter,
  IpConverters,
  ItemMoniker,
  NSG,
} from '.';

export function getVnetId(id: string): string {
  return path.dirname(path.dirname(id));
}

function parseSubnetMonikers(input: AnyAzureObject): ItemMoniker[] {
  const monikers: ItemMoniker[] = [];
  monikers.push({
    item: input,
    name: `${input.name}/router`,
  });
  return monikers;
}

// Consider 'convert' instead of 'parse'
function parseSubnetNodeSpecs(
  subnet: AzureSubnet,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const vnet = store.getEntity(getVnetId(subnet.id)) as AzureVirtualNetwork;
  const alias = subnet.name;
  const nodes: NodeSpec[] = [];

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = alias + '/inbound';
  const outboundKey = alias + '/outbound';
  const routerKey = alias + '/router';

  const rules: ForwardRuleSpec[] = [
    // Traffice leaving subnet
    {
      destination: outboundKey,
      destinationIp: `except ${subnet.properties.addressPrefix}`,
    },
  ];

  if (subnet.properties.ipConfigurations) {
    for (const ip of subnet.properties.ipConfigurations) {
      const ipConfig = store.getEntity<AzureIPConfiguration>(ip.id);
      const converter = IpConverters.asConverter(ipConfig);

      const ipNodes = converter.convert(ipConfig, store);

      for (const ipNode of ipNodes) {
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

    const nsgRules = NSG.parseRules(nsg, vnet);

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

export const SubnetConverter: IAzureConverter<AzureSubnet> = {
  supportedType: 'Microsoft.Network/virtualNetworks/subnets',
  monikers: parseSubnetMonikers,
  convert: parseSubnetNodeSpecs,
};
