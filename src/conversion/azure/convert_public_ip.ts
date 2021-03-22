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
  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');
  const outboundKey = services.nodes.createKeyVariant(keyPrefix, 'outbound');

  let routes: PublicIpRoutes = {inbound: [], outbound: []};

  if (publicIpSpec.properties.ipConfiguration) {
    const ipconfig = services.index.dereference(
      publicIpSpec.properties.ipConfiguration
    );

    if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
      routes = createNicRoutesForPublicIp(
        publicIpSpec.properties.ipAddress,
        ipconfig.properties.privateIPAddress,
        gatewayKey,
        internetKey
      );
    } else if (ipconfig.type === AzureObjectType.LOAD_BALANCER_FRONT_END_IP) {
      routes = services.convert.loadBalancerFrontend(
        services,
        ipconfig,
        publicIpSpec,
        gatewayKey
      );
    }

    if (routes.inbound.length > 0) {
      // Create inbound node
      services.nodes.add({
        key: inboundKey,
        routes: routes.inbound,
      });
    }

    if (routes.outbound.length > 0) {
      // Create outbound node

      services.nodes.add({
        key: outboundKey,
        routes: routes.outbound,
      });
    }

    const inbound: RoutingRuleSpec[] = [
      {
        destination: inboundKey,
        constraints: {
          destinationIp: publicIpSpec.properties.ipAddress,
        },
      },
    ];

    return {inbound, outbound: []};
  }

  return {inbound: [], outbound: []};
}

function createNicRoutesForPublicIp(
  publicIp: string,
  privateIp: string,
  inboundKey: string,
  outboundKey: string
): PublicIpRoutes {
  const inbound: RoutingRuleSpec[] = [
    {
      destination: inboundKey,
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
      destination: outboundKey,
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
