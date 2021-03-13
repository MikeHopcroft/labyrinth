import {NodeSpec} from '../../graph';

import {IMaterializedResult} from '../types';

import {commonTypes} from './convert_common';
import {normalizedNodeKey, normalizedSymbolKey} from './formatters';

import {
  AzureNetworkInterface,
  INetworkInterfaceNode,
  IReleatedX,
} from './types';

function* relatedItemKeys(
  spec: AzureNetworkInterface
): IterableIterator<string> {
  if (spec.properties.networkSecurityGroup) {
    yield spec.properties.networkSecurityGroup.id;
  }

  for (const ipConfig of spec.properties.ipConfigurations) {
    yield ipConfig.id;

    if (ipConfig.properties.subnet) {
      yield ipConfig.properties.subnet.id;
    }
  }
}

export function materializeNetworkInterface(
  node: INetworkInterfaceNode
): IMaterializedResult {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const prefix = normalizedNodeKey(node.specId);
  const inbound = prefix + '/inbound';
  const outbound = prefix + '/outbound';

  const subnetNodeSpec = node.subnet();
  const rules = node.nsg()?.convertRules(subnetNodeSpec.vnet().serviceTag);

  const ips = [...node.ips()];
  const ip = ips.map(x => x.ipAddress).join(',');

  const inboundNode: NodeSpec = {
    key: inbound,
    endpoint: true,
    filters: rules?.inboundRules,
    routes: [],
  };

  const outboundNode: NodeSpec = {
    key: outbound,
    filters: rules?.outboundRules,
    routes: [
      {
        destination: subnetNodeSpec.keys.outbound,
      },
    ],
  };

  return {
    nodes: [inboundNode, outboundNode],
    serviceTags: [{tag: node.serviceTag, value: ip}],
  };
}

export function createNetworkInterfaceNode(
  services: IReleatedX,
  spec: AzureNetworkInterface
): INetworkInterfaceNode {
  const common = commonTypes(spec, services);

  const node = {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: `${normalizedNodeKey(spec.id)}/inbound`,
    specId: spec.id,
    type: spec.type,
    subnet: common.subnet,
    nsg: common.nsg,
    ips: common.localIps,
    relatedSpecIds: () => {
      return relatedItemKeys(spec);
    },
    materialize: () => {
      return materializeNetworkInterface(node);
    },
  };
  return node;
}
