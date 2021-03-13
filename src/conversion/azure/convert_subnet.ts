import {NodeSpec, RoutingRuleSpec} from '../../graph';

import {IMaterializedResult} from '../types';

import {commonTypes} from './convert_common';
import {normalizedSymbolKey, subnetKeys} from './formatters';
import {AzureSubnet, IReleatedX, ISubnetNode} from './types';

function* relatedItemKeys(spec: AzureSubnet): IterableIterator<string> {
  if (spec.properties.networkSecurityGroup) {
    yield spec.properties.networkSecurityGroup.id;
  }
}

function materializeSubnet(nodeSpec: ISubnetNode): IMaterializedResult {
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

  const outboundNode: NodeSpec = {
    key: nodeSpec.keys.outbound,
    filters: nsgRules?.outboundRules ?? [],
    routes: [
      {
        destination: nodeSpec.vnet().nodeKey,
      },
    ],
  };

  return {
    nodes: [inboundNode, outboundNode],
    serviceTags: [
      {
        tag: nodeSpec.serviceTag,
        value: nodeSpec.addressPrefix,
      },
    ],
  };
}

export function createSubnetNode(
  services: IReleatedX,
  spec: AzureSubnet
): ISubnetNode {
  const common = commonTypes(spec, services);

  const keys = subnetKeys(spec);
  const node = {
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
    materialize: () => {
      return materializeSubnet(node);
    },
  };
  return node;
}
