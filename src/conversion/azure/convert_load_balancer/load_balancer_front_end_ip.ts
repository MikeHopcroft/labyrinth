import {noOpMaterialize} from '../convert_common';
import {normalizedNodeKey, normalizedSymbolKey} from '../formatters';

import {
  AzureLoadBalancerFrontEndIp,
  AzureObjectType,
  AnyAzureObject,
  ILoadBalancerFrontEndIpNode,
  asSpec,
  IpNode,
  IReleatedX,
} from '../types';

function* relatedFrontEndIpItems(spec: AzureLoadBalancerFrontEndIp) {
  yield spec.properties.publicIPAddress.id;
}

export function createLoadBalancerFrontEndIpNode(
  services: IReleatedX,
  input: AnyAzureObject
): ILoadBalancerFrontEndIpNode {
  const spec = asSpec<AzureLoadBalancerFrontEndIp>(
    input,
    AzureObjectType.LOAD_BALANCER_FRONT_END_IP
  );

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    ip: () => {
      return services.getSingle<IpNode>(spec, AzureObjectType.PUBLIC_IP);
    },
    relatedSpecIds: () => {
      return relatedFrontEndIpItems(spec);
    },
    materialize: noOpMaterialize,
  };
}
