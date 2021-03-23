import {RoutingRuleSpec} from '../../graph';

import {AzureObjectType, AzurePublicIP} from './azure_types';
import {GraphServices} from './graph_services';

export interface PublicIpRoutes {
  inbound: RoutingRuleSpec[];
  outbound: RoutingRuleSpec[];
}

export function convertPublicIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  gatewayKey: string,
  internetKey: string
): PublicIpRoutes {
  if (publicIpSpec.properties.ipConfiguration) {
    const ipconfig = services.index.dereference(
      publicIpSpec.properties.ipConfiguration
    );

    if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
      return createNicRoutesForPublicIp(
        publicIpSpec.properties.ipAddress,
        ipconfig.properties.privateIPAddress,
        internetKey,
        gatewayKey
      );
    } else if (ipconfig.type === AzureObjectType.LOAD_BALANCER_FRONT_END_IP) {
      return services.convert.loadBalancerFrontend(
        services,
        ipconfig,
        publicIpSpec,
        gatewayKey
      );
    }
  }

  return {inbound: [], outbound: []};
}

function createNicRoutesForPublicIp(
  publicIp: string,
  privateIp: string,
  internetKey: string,
  gatewayKey: string
): PublicIpRoutes {
  const inbound: RoutingRuleSpec[] = [
    {
      destination: gatewayKey,
      constraints: {
        destinationIp: publicIp,
      },
      override: {
        destinationIp: privateIp,
      },
    },
  ];

  const outbound = [
    {
      destination: internetKey,
      constraints: {
        sourceIp: privateIp,
      },
      override: {
        sourceIp: publicIp,
      },
    },
  ];

  return {inbound, outbound};
}
