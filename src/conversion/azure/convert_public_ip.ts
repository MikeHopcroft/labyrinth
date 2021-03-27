import {RoutingRuleSpec} from '../../graph';

import {
  AzureLoadBalancer,
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
  backboneKey: string,
  internetKey: string
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(publicIpSpec);

  const outboundInternetKey = whenPublicIpPrefersInternet(publicIpSpec)
    ? internetKey
    : backboneKey;

  if (publicIpSpec.properties.ipConfiguration) {
    const ipconfig = services.index.dereference(
      publicIpSpec.properties.ipConfiguration
    );

    if (
      ipconfig.type === AzureObjectType.PRIVATE_IP &&
      publicIpSpec.properties.ipAddress
    ) {
      return publicIpWithPrivateIp(
        services,
        publicIpSpec,
        ipconfig,
        outboundInternetKey
      );
    } else if (ipconfig.type === AzureObjectType.LOAD_BALANCER_FRONT_END_IP) {
      return loadBalancedPublicIp(services, publicIpSpec, ipconfig);
    } else {
      services.trackUnsupportedSpec('convertPublicIp', ipconfig);
    }
  } else if (publicIpSpec.properties.ipAddress) {
    // This public ip exists in the resource graph, but is not bound to an
    // internal ip address.
    return isolatedPublicIp(services, publicIpSpec);
  }

  return {inbound: [], outbound: []};
}

function publicIpWithPrivateIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  privateIpSpec: AzurePrivateIP,
  outboundInternetKey: string
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(privateIpSpec);

  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');
  const outboundKey = services.nodes.createKeyVariant(keyPrefix, 'outbound');

  if (!publicIpSpec.properties.ipAddress) {
    throw new TypeError('Invalid Public IP Configuration');
  }

  const vnetId = services.index.getParentId(privateIpSpec.properties.subnet);
  const vnetSpec = services.index.dereference(vnetId);
  const vnetKey = services.nodes.createKey(vnetSpec);
  const vnetRouterKey = services.nodes.createKeyVariant(vnetKey, 'router');

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    routes: [
      {
        destination: vnetRouterKey,
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
        destination: outboundInternetKey,
        override: {
          sourceIp: publicIpSpec.properties.ipAddress,
        },
      },
    ],
  });

  // TODO: Public IPs should be bound as part of the virutal network process
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

function loadBalancedPublicIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  lbIpSpec: AzureLoadBalancerFrontEndIp
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(lbIpSpec);

  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');

  if (!publicIpSpec.properties.ipAddress) {
    throw new TypeError('Invalid Public IP Configuration');
  }

  const lbRef = services.index.getParentId(lbIpSpec);
  const lbSpec = services.index.dereference<AzureLoadBalancer>(lbRef);
  const lbKey = services.nodes.createKey(lbSpec);

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    routes: [
      {
        destination: lbKey,
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
    outbound: [],
  };
}

function isolatedPublicIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP
): PublicIpRoutes {
  const keyPrefix = services.nodes.createKey(publicIpSpec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');

  if (!publicIpSpec.properties.ipAddress) {
    throw new TypeError('Invalid Public IP Configuration');
  }

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

function whenPublicIpPrefersInternet(spec: AzurePublicIP): boolean {
  const tag = spec.properties.ipTags?.find(
    x => x.ipTagType === 'RoutingPreference'
  );

  return tag?.tag === 'Internet';
}
