import {NodeSpec, RoutingRuleSpec} from '../../graph';

import {IGraphServices} from '../types';

import {commonTypes} from './convert_common';
import {normalizedSymbolKey, subnetKeys} from './formatters';
import {
  AnyAzureObject,
  asSpec,
  AzureObjectType,
  AzureSubnet,
  IReleatedX,
  ISubnetNode,
  IAzureGraphNode,
} from './types';

function* relatedItemKeys(spec: AzureSubnet): IterableIterator<string> {
  if (spec.properties.networkSecurityGroup) {
    yield spec.properties.networkSecurityGroup.id;
  }
}

function materializeSubnet(services: IGraphServices, nodeSpec: ISubnetNode) {
  const routes: RoutingRuleSpec[] = [];

  // For each ipConfiguration
  //   Materialize ipConfiguration
  //   Add routing rule
  for (const nic of nodeSpec.nics()) {
    routes.push({
      destination: nic.nodeKey,
      constraints: {destinationIp: nic.serviceTag},
    });
  }

  const nsg = nodeSpec.nsg();
  const nsgRules = nsg?.convertRules(nodeSpec.vnet().serviceTag);

  const inboundNode: NodeSpec = {
    key: nodeSpec.keys.inbound,
    filters: nsgRules?.inboundRules ?? [],
    // TODO: do we want range here?
    // TODO: is this correct? The router moves packets in both directions.
    routes,
  };
  services.addNode(inboundNode);

  const outboundNode: NodeSpec = {
    key: nodeSpec.keys.outbound,
    filters: nsgRules?.outboundRules ?? [],
    routes: [
      {
        destination: nodeSpec.vnet().nodeKey,
      },
    ],
  };
  services.addNode(outboundNode);
  services.defineServiceTag(nodeSpec.serviceTag, nodeSpec.addressPrefix);
}

export function createSubnetNode(
  services: IReleatedX,
  refSpec: AnyAzureObject
): ISubnetNode {
  const spec = asSpec<AzureSubnet>(refSpec, AzureObjectType.SUBNET);
  const common = commonTypes(spec, services);

  const keys = subnetKeys(spec);
  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: keys.inbound,
    specId: spec.id,
    type: spec.type,
    keys,
    addressPrefix: spec.properties.addressPrefix,
    relatedSpecIds: () => {
      return relatedItemKeys(spec);
    },
    nics: common.nics,
    vnet: common.vnet,
    nsg: common.nsg,
    materialize: (services: IGraphServices, node: IAzureGraphNode) => {
      materializeSubnet(services, node as ISubnetNode);
    },
  };
}
