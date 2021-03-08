import {IGraphServices} from '../../types';

import {normalizedNodeKey, normalizedSymbolKey} from '../formatters';

import {
  AzureLoadBalancerBackendPool,
  AzureObjectType,
  AnyAzureObject,
  asSpec,
  ILoadBalancerBackendPoolNode,
  IReleatedX,
  ISubnetNode,
} from '../types';
import {commonTypes} from './load_balancer_common';

function* relatedBackendItems(spec: AzureLoadBalancerBackendPool) {
  for (const backend of spec.properties.backendIPConfigurations) {
    yield backend.id;
  }
}

function materializeBackendPool(
  services: IGraphServices,
  node: ILoadBalancerBackendPoolNode
) {
  const ips = [...node.ips()].map(x => x.ipAddress);

  if (!ips || ips.length === 0) {
    throw new Error('Invalid backend pool configuration');
  }
  services.defineServiceTag(node.serviceTag, ips.join(','));
}

export function createLoadBalancerBackendPool(
  services: IReleatedX,
  input: AnyAzureObject
): ILoadBalancerBackendPoolNode {
  const spec = asSpec<AzureLoadBalancerBackendPool>(
    input,
    AzureObjectType.LOAD_BALANCER_BACKEND_POOL
  );
  const common = commonTypes(spec, services);

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    ips: common.poolIps,
    subnet: () => {
      let subnet: ISubnetNode | undefined;
      for (const ipconfig of common.poolIps()) {
        subnet = ipconfig.subnet();
        break;
      }

      if (!subnet) {
        throw new TypeError('Invalid backend pool configuration');
      }

      return subnet;
    },
    relatedSpecIds: () => {
      return relatedBackendItems(spec);
    },
    materialize: materializeBackendPool,
  };
}
