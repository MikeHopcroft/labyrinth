import {IGraphServices} from '../types';
import {
  AzureObjectBase,
  AzureObjectType,
  INetworkInterfaceNode,
  INetworkSecurityGroupNode,
  IpNode,
  IReleatedX,
  ISubnetNode,
  IAzureGraphNode,
  IVirtualNetworkNode,
} from './types';

export interface ICommonX {
  localIps(): IterableIterator<IpNode>;
  nics(): IterableIterator<INetworkInterfaceNode>;
  nsg(): INetworkSecurityGroupNode | undefined;
  subnet(): ISubnetNode;
  subnets(): IterableIterator<ISubnetNode>;
  vnet(): IVirtualNetworkNode;
}

export function commonTypes(
  spec: AzureObjectBase,
  services: IReleatedX
): ICommonX {
  return {
    localIps: () => {
      return services.getRelated(spec, AzureObjectType.LOCAL_IP);
    },
    nics: () => {
      return services.getRelated(spec, AzureObjectType.NIC);
    },
    nsg: () => {
      return services.getSingleOrDefault(spec, AzureObjectType.NSG);
    },
    subnet: () => {
      return services.getSingle(spec, AzureObjectType.SUBNET);
    },
    subnets: () => {
      return services.getRelated(spec, AzureObjectType.SUBNET);
    },
    vnet: () => {
      return services.getSingle(spec, AzureObjectType.VIRTUAL_NETWORK);
    },
  };
}

export function noOpMaterialize(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  services: IGraphServices,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: IAzureGraphNode
): void {}

export function noExplicitRelations() {
  return [].values();
}
