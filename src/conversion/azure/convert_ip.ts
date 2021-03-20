import {SimpleRoutingRuleSpec} from '../../graph';

import {AzureIPConfiguration, AzureObjectType} from './azure_types';

import {GraphServices} from './graph_services';

function convertToIpAddress(ipItem: AzureIPConfiguration): string {
  let ip: string;
  if (ipItem.type === AzureObjectType.PRIVATE_IP) {
    ip = ipItem.properties.privateIPAddress;
  } else {
    ip = ipItem.properties.ipAddress;
  }
  return ip;
}

export function convertIp(
  services: GraphServices,
  spec: AzureIPConfiguration,
  parent: string
): SimpleRoutingRuleSpec {
  const sourceIp = convertToIpAddress(spec);
  const ipNodeKey = services.nodes.createKey(spec);

  const routes: SimpleRoutingRuleSpec[] = [
    {
      destination: parent,
      constraints: {destinationIp: `except ${sourceIp}`},
    },
  ];

  services.nodes.add({
    key: ipNodeKey,
    name: spec.id,
    endpoint: true,
    range: {sourceIp},
    routes,
  });

  return {destination: ipNodeKey, constraints: {destinationIp: sourceIp}};
}
