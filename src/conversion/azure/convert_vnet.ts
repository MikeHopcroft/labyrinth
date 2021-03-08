import DRange from 'drange';

import {formatIpLiteral, parseIp} from '../../dimensions';
import {RoutingRuleSpec} from '../../graph';

import {IGraphServices} from '../types';
import {normalizedNodeKey, normalizedSymbolKey} from './formatters';

import {commonTypes} from './convert_common';
import {
  IReleatedX,
  AnyAzureObject,
  asSpec,
  AzureObjectType,
  AzureVirtualNetwork,
  IAzureGraphNode,
  IVirtualNetworkNode,
} from './types';

function materializeVirtualNetwork(
  services: IGraphServices,
  nodeSpec: IVirtualNetworkNode
) {
  // Compute this VNet's address range by unioning up all of its address prefixes.
  const addressRange = new DRange();
  for (const address of nodeSpec.addressPrefixes) {
    const ip = parseIp(address);
    addressRange.add(ip);
  }
  const sourceIp = formatIpLiteral(addressRange);
  services.defineServiceTag(nodeSpec.serviceTag, sourceIp);

  // Create outbound rule (traffic leaving vnet).
  const routes: RoutingRuleSpec[] = [
    {
      destination: services.getInternetKey(),
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

  services.addNode({
    key: nodeSpec.nodeKey,
    range: {sourceIp},
    routes,
  });
}

function* relatedItemKeys(spec: AzureVirtualNetwork): IterableIterator<string> {
  for (const item of spec.properties.subnets) {
    yield item.id;
  }

  yield 'Internet';
}

export function createVirtualNetworkNode(
  services: IReleatedX,
  input: AnyAzureObject
): IVirtualNetworkNode {
  const spec = asSpec<AzureVirtualNetwork>(
    input,
    AzureObjectType.VIRTUAL_NETWORK
  );
  const common = commonTypes(spec, services);
  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    relatedSpecIds: () => {
      return relatedItemKeys(spec);
    },
    type: spec.type,
    addressPrefixes: spec.properties.addressSpace.addressPrefixes,
    subnets: common.subnets,
    materialize: (services: IGraphServices, node: IAzureGraphNode) => {
      materializeVirtualNetwork(services, node as IVirtualNetworkNode);
    },
  };
}
