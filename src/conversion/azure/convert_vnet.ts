import DRange from 'drange';

import {formatIpLiteral, parseIp} from '../../dimensions';
import {RoutingRuleSpec} from '../../graph';

import {IMaterializedResult} from '../types';

import {normalizedNodeKey, normalizedSymbolKey} from './formatters';
import {commonTypes} from './convert_common';
import {IReleatedX, AzureVirtualNetwork, IVirtualNetworkNode} from './types';

function materializeVirtualNetwork(
  nodeSpec: IVirtualNetworkNode
): IMaterializedResult {
  // Compute this VNet's address range by unioning up all of its address prefixes.
  const addressRange = new DRange();
  for (const address of nodeSpec.addressPrefixes) {
    const ip = parseIp(address);
    addressRange.add(ip);
  }
  const sourceIp = formatIpLiteral(addressRange);

  // Create outbound rule (traffic leaving vnet).
  const routes: RoutingRuleSpec[] = [
    {
      destination: 'Internet',
      constraints: {destinationIp: `except ${sourceIp}`},
    },
  ];

  const vnetDestinations: string[] = [];
  // Materialize subnets and create routes to each.
  for (const {
    nodeKey: subnetNodeKey,
    serviceTag: destinationIp,
  } of nodeSpec.subnets()) {
    routes.push({
      destination: subnetNodeKey,
      constraints: {destinationIp},
    });
    vnetDestinations.push(destinationIp);
  }

  return {
    nodes: [
      {
        key: nodeSpec.nodeKey,
        range: {sourceIp},
        routes,
      },
    ],
    serviceTags: [
      {
        tag: nodeSpec.serviceTag,
        value: sourceIp,
      },
    ],
  };
}

function* relatedItemKeys(spec: AzureVirtualNetwork): IterableIterator<string> {
  for (const item of spec.properties.subnets) {
    yield item.id;
  }

  yield 'Internet';
}

export function createVirtualNetworkNode(
  services: IReleatedX,
  spec: AzureVirtualNetwork
): IVirtualNetworkNode {
  const common = commonTypes(spec, services);
  const node = {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    relatedSpecIds: () => {
      return relatedItemKeys(spec);
    },
    type: spec.type,
    addressPrefixes: spec.properties.addressSpace.addressPrefixes,
    subnets: common.subnets,
    materialize: () => {
      return materializeVirtualNetwork(node);
    },
  };

  return node;
}
