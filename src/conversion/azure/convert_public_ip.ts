import {RoutingRuleSpec} from '../../graph';

import {
  AzureLoadBalancerFrontEndIp,
  AzureObjectType,
  AzurePrivateIP,
  AzurePublicIP,
} from './azure_types';

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
  services.nodes.markTypeAsUsed(publicIpSpec);

  if (publicIpSpec.properties.ipConfiguration) {
    const ipconfig = services.index.dereference(
      publicIpSpec.properties.ipConfiguration
    );

    if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
      return publicIpWithPrivateIp(
        services,
        publicIpSpec,
        ipconfig,
        gatewayKey,
        internetKey
      );
    } else if (ipconfig.type === AzureObjectType.LOAD_BALANCER_FRONT_END_IP) {
      return loadBalancerFrontEndIp(
        services,
        publicIpSpec,
        ipconfig,
        gatewayKey
      );
    } else {
      // return {inbound: [], outbound: []};
      const message = `unsupported IP config type '${ipconfig.type}'`;
      throw new TypeError(message);
    }
  } else {
    // This public ip exists in the resource graph, but is not bound to an
    // internal ip address.
    return isolatedPublicIp(services, publicIpSpec);
  }
}

function publicIpWithPrivateIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  privateIpSpec: AzurePrivateIP,
  gatewayKey: string,
  internetKey: string
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(privateIpSpec);

  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');
  const outboundKey = services.nodes.createKeyVariant(keyPrefix, 'outbound');

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    routes: [
      {
        destination: gatewayKey,
        override: {
          destinationIp: privateIpSpec.properties.privateIPAddress,
        },
      },
    ],
  });

  // Create outbound node
  services.nodes.add({
    key: outboundKey,
    routes: [
      {
        destination: internetKey,
        override: {
          sourceIp: publicIpSpec.properties.ipAddress,
        },
      },
    ],
  });

  return {
    inbound: [
      {
        destination: inboundKey,
        constraints: {
          destinationIp: publicIpSpec.properties.ipAddress,
        },
      },
    ],
    outbound: [
      {
        destination: outboundKey,
        constraints: {
          sourceIp: privateIpSpec.properties.privateIPAddress,
        },
      },
    ],
  };
}

function loadBalancerFrontEndIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  lbIpSpec: AzureLoadBalancerFrontEndIp,
  gatewayKey: string
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(lbIpSpec);

  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');

  const route = services.convert.loadBalancerFrontend(
    services,
    lbIpSpec,
    gatewayKey
  );

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    routes: [route],
  });

  return {
    inbound: [
      {
        destination: inboundKey,
        constraints: {
          destinationIp: publicIpSpec.properties.ipAddress,
        },
      },
    ],
    outbound: [],
  };
}

function isolatedPublicIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP
): PublicIpRoutes {
  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    routes: [],
  });

  return {
    inbound: [
      {
        destination: inboundKey,
        constraints: {
          destinationIp: publicIpSpec.properties.ipAddress,
        },
      },
    ],
    outbound: [],
  };
}
