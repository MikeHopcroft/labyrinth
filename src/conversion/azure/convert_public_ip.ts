import {RoutingRuleSpec} from '../../graph';

import {AzureObjectType, AzurePublicIP} from './azure_types';
import {GraphServices} from './graph_services';

export interface PublicIpRoutes {
  inbound?: RoutingRuleSpec;
  outbound?: RoutingRuleSpec;
}

export function convertPublicIp(
  services: GraphServices,
  spec: AzurePublicIP,
  gatewayKey: string,
  internetKey: string
): PublicIpRoutes {
  if (!spec.properties.ipConfiguration) {
    return {inbound: undefined, outbound: undefined};
  }

  const ipconfig = services.index.dereference(spec.properties.ipConfiguration);

  let privateIp: string | undefined;
  let outbound: RoutingRuleSpec | undefined;

  if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
    privateIp = ipconfig.properties.privateIPAddress;

    outbound = {
      destination: internetKey,
      constraints: {
        sourceIp: privateIp,
      },
      override: {
        sourceIp: spec.properties.ipAddress,
      },
    };
  } else {
    return {inbound: undefined, outbound: undefined};
  }

  const inbound: RoutingRuleSpec = {
    destination: gatewayKey,
    constraints: {
      destinationIp: spec.properties.ipAddress,
    },
    override: {
      destinationIp: privateIp,
    },
  };

  return {inbound, outbound};
}
