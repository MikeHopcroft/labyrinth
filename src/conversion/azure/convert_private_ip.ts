import {SimpleRoutingRuleSpec} from '../../graph';

import {AzurePrivateIP} from './azure_types';
import {GraphServices} from './graph_services';

export function convertPrivateIp(
  services: GraphServices,
  spec: AzurePrivateIP,
  parent: string
): SimpleRoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  const sourceIp = spec.properties.privateIPAddress;
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
