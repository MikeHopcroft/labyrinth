import {IMaterializedResult} from '../../types';

import {normalizedNodeKey, normalizedSymbolKey} from '../formatters';

import {
  AzureLoadBalancerBackendPool,
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
  node: ILoadBalancerBackendPoolNode
): IMaterializedResult {
  const ips = [...node.ips()].map(x => x.ipAddress);

  if (!ips || ips.length === 0) {
    throw new Error('Invalid backend pool configuration');
  }

  return {
    nodes: undefined,
    serviceTags: [
      {
        tag: node.serviceTag,
        value: ips.join(','),
      },
    ],
  };
}

export function createLoadBalancerBackendPool(
  services: IReleatedX,
  spec: AzureLoadBalancerBackendPool
): ILoadBalancerBackendPoolNode {
  const common = commonTypes(spec, services);

  const node = {
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
    materialize: () => {
      return materializeBackendPool(node);
    },
  };

  return node;
}
