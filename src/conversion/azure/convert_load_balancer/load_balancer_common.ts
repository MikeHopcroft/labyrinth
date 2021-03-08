import {
  AzureObjectBase,
  AzureObjectType,
  ILoadBalancerBackendPoolNode,
  ILoadBalancerFrontEndIpNode,
  IpNode,
  IReleatedX,
} from '../types';

export interface ICommonLB {
  frontEndIp(): ILoadBalancerFrontEndIpNode;
  backendIp(): IpNode;
  backendPool(): ILoadBalancerBackendPoolNode;
  poolIps(): IterableIterator<IpNode>;
}

function* loadBalancerPoolIps(
  spec: AzureObjectBase,
  services: IReleatedX
): IterableIterator<IpNode> {
  yield* services.getRelated(spec, AzureObjectType.LOCAL_IP);
  yield* services.getRelated(spec, AzureObjectType.VMSS_VIRTUAL_IP);
}

export function commonTypes(
  spec: AzureObjectBase,
  services: IReleatedX
): ICommonLB {
  return {
    frontEndIp: () => {
      return services.getSingle(
        spec,
        AzureObjectType.LOAD_BALANCER_FRONT_END_IP
      );
    },
    backendIp: () => {
      return services.getSingle(spec, AzureObjectType.LOCAL_IP);
    },
    backendPool: () => {
      return services.getSingle(
        spec,
        AzureObjectType.LOAD_BALANCER_BACKEND_POOL
      );
    },
    poolIps: () => {
      return loadBalancerPoolIps(spec, services);
    },
  };
}
