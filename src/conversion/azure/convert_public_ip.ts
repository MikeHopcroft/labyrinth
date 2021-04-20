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

  const outboundRoutingKey = selectRoutingPreference(
    publicIpSpec,
    internetKey,
    backboneKey
  );

  if (publicIpSpec.properties.ipAddress) {
    const publicIp = publicIpSpec.properties.ipAddress;

    if (publicIpSpec.properties.ipConfiguration) {
      const ipconfig = services.index.dereference(
        publicIpSpec.properties.ipConfiguration
      );

      if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
        return publicIpWithPrivateIp(
          services,
          publicIpSpec,
          publicIp,
          ipconfig,
          outboundRoutingKey
        );
      } else if (ipconfig.type === AzureObjectType.LOAD_BALANCER_FRONT_END_IP) {
        return loadBalancedPublicIp(services, publicIpSpec, publicIp, ipconfig);
      } else {
        services.trackUnsupportedSpec('convertPublicIp', ipconfig);
      }
    } else {
      // This public ip exists in the resource graph, but is not bound to an
      // internal ip address.
      return isolatedPublicIp(services, publicIpSpec, publicIp);
    }
  }

  return {inbound: [], outbound: []};
}

function publicIpWithPrivateIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  publicIp: string,
  privateIpSpec: AzurePrivateIP,
  outboundInternetKey: string
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(privateIpSpec);

  const inboundKey = services.nodes.createEndpointKey(publicIpSpec);
  const outboundKey = services.nodes.createOutboundKey(publicIpSpec);

  const vnetId = services.index.getParentId(privateIpSpec.properties.subnet);
  const vnetSpec = services.index.dereference(vnetId);
  const vnetRouterKey = services.nodes.createRouterKey(vnetSpec);

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    friendlyName: publicIpSpec.name,
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
    friendlyName: publicIpSpec.name,
    routes: [
      {
        destination: outboundInternetKey,
        override: {
          sourceIp: publicIp,
        },
      },
    ],
  });

  // TODO: Public IPs should be bound as part of the virutal network process
  return {
    inbound: [publicIpInbound(services, inboundKey, publicIp)],
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
  publicIp: string,
  lbIpSpec: AzureLoadBalancerFrontEndIp
): PublicIpRoutes {
  services.nodes.markTypeAsUsed(lbIpSpec);

  const inboundKey = services.nodes.createEndpointKey(publicIpSpec);
  const lbRef = services.index.getParentId(lbIpSpec);
  const lbSpec = services.index.dereference<AzureLoadBalancer>(lbRef);
  const lbKey = services.nodes.createKey(lbSpec);

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    friendlyName: publicIpSpec.name,
    routes: [
      {
        destination: lbKey,
      },
    ],
  });

  return {
    inbound: [publicIpInbound(services, inboundKey, publicIp)],
    outbound: [],
  };
}

function isolatedPublicIp(
  services: GraphServices,
  publicIpSpec: AzurePublicIP,
  publicIp: string
): PublicIpRoutes {
  const inboundKey = services.nodes.createEndpointKey(publicIpSpec);

  // Create inbound node
  services.nodes.add({
    key: inboundKey,
    friendlyName: publicIpSpec.name,
    routes: [],
  });

  return {
    inbound: [publicIpInbound(services, inboundKey, publicIp)],
    outbound: [],
  };
}

function publicIpInbound(
  services: GraphServices,
  destination: string,
  destinationIp: string
) {
  return {
    destination,
    constraints: {
      destinationIp,
      sourceIp: services.getInternetServiceTag(),
    },
  };
}

function selectRoutingPreference(
  spec: AzurePublicIP,
  internetKey: string,
  backboneKey: string
): string {
  const tag = spec.properties.ipTags?.find(
    x => x.ipTagType === 'RoutingPreference'
  );

  if (tag?.tag === 'Internet') {
    return internetKey;
  }

  return backboneKey;
}
