import {NodeSpec, RoutingRuleSpec} from '../../graph';

import {IRules} from '../types';

import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';

import {
  AzureReference,
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureObjectType,
} from './types';

export function convertSubnet(
  services: GraphServices,
  subnetSpec: AzureSubnet,
  vNetKey: string
): NodeKeyAndSourceIp {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const subnetKeyPrefix = subnetSpec.id;
  const subnetServiceTag = subnetSpec.id;

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = subnetKeyPrefix + '/inbound';
  const outboundKey = subnetKeyPrefix + '/outbound';
  const routerKey = subnetKeyPrefix + '/router';

  const sourceIp = subnetSpec.properties.addressPrefix;
  services.symbols.defineServiceTag(subnetServiceTag, sourceIp);

  const routes: RoutingRuleSpec[] = [
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
  for (const ip of subnetSpec.properties.ipConfigurations) {
    // Subnets may have ip configurations attached for items which do not exist in the
    // the resource graph. The first example of this is specifically for Virtual Machine
    // Scale Set ip configurations.
    if (services.index.has(ip.id)) {
      const ipConfigSpec = services.index.dereference<AzureIPConfiguration>(
        ip
      );
      routes.push(services.convert.ip(
        services,
        ipConfigSpec
      ));
    }
    // TODO: else clause?

    for (const ipConfigSpec of services.groups.items<AzureIPConfiguration>(
      AzureObjectType.LOCAL_IP,
      subnetSpec
    )) {
      routes.push(services.convert.ip(
        services,
        ipConfigSpec
      ));
    }
  }

  const routerNode: NodeSpec = {
    key: routerKey,
    // TODO: do we want range here?
    range: {sourceIp},
    routes,
  };
  services.addNode(routerNode);

  const nsgRules = convertNsgRules(
    subnetSpec.properties.networkSecurityGroup,
    services,
    vNetKey
  );
  const inboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules!.inboundRules,
    // TODO: do we want range here?
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
    filters: nsgRules!.outboundRules,
    routes: [
      {
        destination: vNetKey,
      },
    ],
  };
  services.addNode(outboundNode);

  // TODO: What should be returned here? Subnet is represetned by 3 nodes...
  return {
    key: inboundNode.key,
    destinationIp: subnetSpec.properties.addressPrefix,
  };
}

function convertNsgRules(
  nsgRef: AzureReference<AzureNetworkSecurityGroup>,
  services: GraphServices,
  vNetKey: string
): IRules | undefined {
  if (nsgRef) {
    const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
      nsgRef
    );

    // FIX: vNetKey needs to be a symbol not just a node key
    return services.convert.nsg(services, nsgSpec, vNetKey);
  }

  return undefined;
}

