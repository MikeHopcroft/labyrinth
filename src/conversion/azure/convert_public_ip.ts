import {RoutingRuleSpec} from '../../graph';

import {AzureObjectType, AzurePublicIP} from './azure_types';
import {GraphServices} from './graph_services';

export interface PublicIpRoutes {
  inbound: RoutingRuleSpec;
  outbound?: RoutingRuleSpec;
}

export function convertPublicIp(
  services: GraphServices,
  spec: AzurePublicIP,
  gatewayKey: string,
  internetKey: string
): PublicIpRoutes {
  const keyPrefix = services.nodes.createKey(spec);
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');

  const inbound: RoutingRuleSpec = {
    destination: inboundKey,
    constraints: {
      destinationIp: spec.properties.ipAddress,
    },
  };

  if (spec.properties.ipConfiguration) {
    const ipconfig = services.index.dereference(
      spec.properties.ipConfiguration
    );

    if (ipconfig.type === AzureObjectType.PRIVATE_IP) {
      const privateIp = ipconfig.properties.privateIPAddress;

      // Create inbound node
      services.nodes.add({
        key: inboundKey,
        routes: [
          {
            destination: gatewayKey,
            override: {
              destinationIp: privateIp,
            },
          },
        ],
      });

      // Create outbound node
      const outboundKey = services.nodes.createKeyVariant(
        keyPrefix,
        'outbound'
      );
      services.nodes.add({
        key: outboundKey,
        routes: [
          {
            destination: internetKey,
            override: {
              sourceIp: spec.properties.ipAddress,
            },
          },
        ],
      });

      const outbound: RoutingRuleSpec = {
        destination: outboundKey,
        constraints: {
          sourceIp: privateIp,
        },
      };

      return {inbound, outbound};
    } else {
      const message = `unknown IpConfig type '${ipconfig.type}'`;
      throw new TypeError(message);
    }
  } else {
    // This publicIp does not have an associated privateIp.
    // The inbound node has no routes, and there is no outbound node.
    services.nodes.add({
      key: inboundKey,
      routes: [],
    });

    return {inbound};
  }
}
