import {RoutingRuleSpec} from '../../graph/types';

import {typedSpec} from './convert';
import {noExplicitRelations} from './convert_common';
import {
  AzureObjectType,
  IReleatedX,
  IAzureGraphNode,
  IVirtualNetworkNode,
} from './types';

const KEY_INTERNET = 'Internet';

export function createInternetNode(services: IReleatedX): IAzureGraphNode {
  const readVnets = () => {
    const spec = typedSpec(KEY_INTERNET, AzureObjectType.VIRTUAL_NETWORK);
    return services.getRelated<IVirtualNetworkNode>(
      spec,
      AzureObjectType.VIRTUAL_NETWORK
    );
  };

  return {
    serviceTag: KEY_INTERNET,
    nodeKey: KEY_INTERNET,
    specId: KEY_INTERNET,
    type: KEY_INTERNET,
    relatedSpecIds: noExplicitRelations,
    materialize: (services, node) => {
      const vnets = readVnets();

      const vnetRules: RoutingRuleSpec[] = [];

      for (const vnet of vnets) {
        vnetRules.push({
          destination: vnet.nodeKey,
          constraints: {destinationIp: vnet.serviceTag},
        });
      }

      // This will be hooked up differently when we get PublicIp working.
      services.addNode({
        // You are using KEY_INTERNET in two different ways here. One is
        // for the node's key and the other is for a service tag. Also,
        // let's discuss the pros/cons of defining service tags for nodes.
        key: KEY_INTERNET,
        endpoint: true,
        range: {
          sourceIp: KEY_INTERNET,
        },
        routes: vnetRules,
      });

      services.defineServiceTag(node.serviceTag, '*');
    },
  };
}
