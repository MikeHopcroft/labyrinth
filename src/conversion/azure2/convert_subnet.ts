import {RoutingRuleSpec} from '../../graph';

import {GraphServices} from './graph_services';
import {AzureSubnet} from './types';

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
      constraints: {destinationIp: `except ${subnetSpec.properties.addressPrefix}`},
      destination: outboundKey,
    },
  ];

  // For each ipConfiguration
  //   Materialize ipConfiguration
  //   Add routing rule

  const routerNode: NodeSpec = {
    key: routerKey,
    range: {
      sourceIp: subnet.properties.addressPrefix,
    },
    routes: rules,
  };
  nodes.push(routerNode);
  return 'subnet';
}
