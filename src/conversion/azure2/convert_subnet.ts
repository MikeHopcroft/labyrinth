import {NodeSpec, RoutingRuleSpec} from '../../graph';

import {IRules} from '../types';

import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';

import {
  AzureIdReference,
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureSubnet,
} from './types';

function convertNsgRules(
  nsgRef: AzureIdReference,
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

export function convertSubnet(
  services: GraphServices,
  subnetSpec: AzureSubnet,
  vNetKey: string
): NodeKeyAndSourceIp {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const subnetKeyPrefix = subnetSpec.id;

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = subnetKeyPrefix + '/inbound';
  const outboundKey = subnetKeyPrefix + '/outbound';

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
  if (subnetSpec.properties.ipConfigurations) {
    for (const ipRef of subnetSpec.properties.ipConfigurations) {
      const {key, destinationIp} = services.convert.ip(services, ipRef);
      routes.push({
        destination: key,
        constraints: {destinationIp},
      });
    }
  }

  const nsgRules = convertNsgRules(
    subnetSpec.properties.networkSecurityGroup,
    services,
    vNetKey
  );

  const inboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules?.inboundRules,
    // TODO: do we want range here?
    // TODO: is this correct? The router moves packets in both directions.
    routes,
  };
  services.addNode(inboundNode);

  const outboundNode: NodeSpec = {
    key: outboundKey,
    filters: nsgRules?.outboundRules,
    routes: [
      {
        destination: 'Internet',
      },
    ],
  };
  services.addNode(outboundNode);

  return {
    key: inboundNode.key,
    destinationIp: subnetSpec.properties.addressPrefix,
  };
}
