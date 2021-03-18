import {SimpleRoutingRuleSpec} from '../../graph';

import {AzureIPConfiguration, AzureObjectType} from './azure_types';

import {GraphServices} from './graph_services';

function convertToIpAddress(ipItem: AzureIPConfiguration): string {
  let ip: string;
  if (ipItem.type === AzureObjectType.LOCAL_IP) {
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
  const ipNodeKey = services.ids.createKey(spec);

  const routes: SimpleRoutingRuleSpec[] = [
    {
      // TODO: this converter should not reach into subnet's spec.
      destination: parent,
      constraints: {destinationIp: `except ${sourceIp}`},
    },
  ];

  // Materialize node
  services.addNode({
    key: ipNodeKey,
    endpoint: true,
    range: {sourceIp},
    routes,
  });

  return {destination: ipNodeKey, constraints: {destinationIp: sourceIp}};
}
