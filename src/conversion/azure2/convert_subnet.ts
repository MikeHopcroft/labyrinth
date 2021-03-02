import {NodeSpec, RoutingRuleSpec} from '../../graph';
import {IRules} from '../types';

import {GraphServices} from './graph_services';
import {
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureSubnet,
} from './types';

export function convertSubnet(
  services: GraphServices,
  subnetSpec: AzureSubnet,
  vNetKey: string
): string {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const subnetKeyPrefix = subnetSpec.id;

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = subnetKeyPrefix + '/inbound';
  const outboundKey = subnetKeyPrefix + '/outbound';
  const routerKey = subnetKeyPrefix + '/router';

  const rules: RoutingRuleSpec[] = [
    // Traffic leaving subnet
    {
      constraints: {
        destinationIp: `except ${subnetSpec.properties.addressPrefix}`,
      },
      destination: outboundKey,
    },
  ];

  // For each ipConfiguration
  //   Materialize ipConfiguration
  //   Add routing rule
  if (subnetSpec.properties.ipConfigurations) {
    for (const ip of subnetSpec.properties.ipConfigurations) {
      // Subnets may have ip configurations attached for items which do not exist in the
      // the resource graph. The first example of this is specifically for Virtual Machine
      // Scale Set ip configurations.
      if (services.hasItem(ip.id)) {
        const ipConfig = services.dereference<AzureIPConfiguration>(ip);
        const ipServiceTag = services.convert.ip(services, ipConfig);
        rules.push({
          destination: ipServiceTag,
          constraints: {destinationIp: ipServiceTag},
        });
      }
    }
  }

  const routerNode: NodeSpec = {
    key: routerKey,
    range: {
      sourceIp: subnetSpec.properties.addressPrefix,
    },
    routes: rules,
  };
  services.addNode(routerNode);

  let nsgRules: IRules | null = null;
  if (subnetSpec.properties.networkSecurityGroup) {
    const nsgSpec = services.dereference<AzureNetworkSecurityGroup>(
      subnetSpec.properties.networkSecurityGroup
    );

    // FIX: vNetKey needs to be a symbol not just a node key
    nsgRules = services.convert.nsg(services, nsgSpec, vNetKey);
  }

  const inboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules?.inboundRules ?? [],
    // NOTE: no range because inbound can receive from any sourceIp
    // TODO: is this correct? The router moves packets in both directions.
    routes: [
      {
        destination: routerKey,
      },
    ],
  };
  services.addNode(inboundNode);

  const outboundNode: NodeSpec = {
    key: outboundKey,
    filters: nsgRules?.outboundRules ?? [],
    range: {
      sourceIp: subnetSpec.properties.addressPrefix,
    },
    routes: [],
  };
  services.addNode(outboundNode);

  // TODO: What should be returned here? Subnet is represetned by 3 nodes...
  return inboundNode.key;
}
