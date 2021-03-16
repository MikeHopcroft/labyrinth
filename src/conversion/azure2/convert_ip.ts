import {RoutingRuleSpec} from '../../graph';

import {GraphServices} from './graph_services';
import {AzureIPConfiguration, AzureObjectType, AzureSubnet} from './types';

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
  ipConfig: AzureIPConfiguration
): RoutingRuleSpec {
  const sourceIp = convertToIpAddress(ipConfig);
  const ipNodeKey = ipConfig.id;

  // TODO: create routing table and node.
  // TODO: deal with ipConfig.properties.subnet undefined.
  const subnetSpec = services.index.dereference<AzureSubnet>(
    ipConfig.properties.subnet!
  );
  const routes: RoutingRuleSpec[] = [
    {
      // TODO: this converter should not reach into subnet's spec.
      destination: subnetSpec.id,
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

  services.symbols.defineServiceTag(ipNodeKey, sourceIp);
  return {destination: ipNodeKey, constraints: {destinationIp: sourceIp}};
  // return {key: ipNodeKey, destinationIp: sourceIp};
}
