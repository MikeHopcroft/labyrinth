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
  if (spec.properties.ipConfiguration) {
    const ipconfig = services.index.dereference(
      spec.properties.ipConfiguration
    );

    if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
      return createNicRoutesForPublicIp(
        spec.properties.ipAddress,
        ipconfig.properties.privateIPAddress,
        internetKey,
        gatewayKey
      );
    }
  }

  return {inbound: undefined, outbound: undefined};
}

function createNicRoutesForPublicIp(
  publicIp: string,
  privateIp: string,
  internetKey: string,
  gatewayKey: string
): PublicIpRoutes {
  const inbound: RoutingRuleSpec = {
    destination: gatewayKey,
    constraints: {
      destinationIp: privateIp,
    },
    override: {
      destinationIp: privateIp,
    },
  };

  const outbound = {
    destination: internetKey,
    constraints: {
      sourceIp: privateIp,
    },
    override: {
      sourceIp: publicIp,
    },
  };

  return {inbound, outbound};
}
