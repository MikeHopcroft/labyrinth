import {RoutingRuleSpec} from '../../../graph';

import {IGraphServices, NSGRuleSpecs} from '../../types';

import {
  AzureObjectBase,
  AzureObjectType,
  AzureReference,
  AzureTypedObject,
  AzureVirtualMachineScaleSet,
  AzureVmssNetworkInterfaceConfig,
} from './specs';

export interface AzureVMSSIpResult {
  vmssId: AzureReference<AzureVirtualMachineScaleSet>;
  interfaceConfig: string;
  ipConfig: string;
  logicalId: number;
}

// TODO: Come up with a real name
export interface IReleatedX {
  getSpec<T extends AzureTypedObject>(specId: string): T;
  getRelated<T extends IAzureGraphNode>(
    refSpec: AzureObjectBase,
    type: AzureObjectType
  ): IterableIterator<T>;
  getSingle<T extends IAzureGraphNode>(
    refSpec: AzureObjectBase,
    type: AzureObjectType
  ): T;
  getSingleOrDefault<T extends IAzureGraphNode>(
    refSpec: AzureObjectBase,
    type: AzureObjectType
  ): T | undefined;
}

export interface IAzureGraphNode {
  readonly serviceTag: string;
  readonly nodeKey: string;
  readonly specId: string;
  readonly type: string;
  relatedSpecIds(): IterableIterator<string>;
  materialize(services: IGraphServices, node: IAzureGraphNode): void;
}

export function isNodeType(
  spec: IAzureGraphNode,
  type: AzureObjectType
): boolean {
  return spec.type.toLowerCase() === type.toLowerCase();
}

export interface IVirtualNetworkNode extends IAzureGraphNode {
  readonly addressPrefixes: string[];
  subnets(): IterableIterator<ISubnetNode>;
}

export interface SubnetKeys {
  readonly prefix: string;
  readonly inbound: string;
  readonly outbound: string;
}

export interface ISubnetNode extends IAzureGraphNode {
  readonly keys: SubnetKeys;
  readonly addressPrefix: string;
  nics(): IterableIterator<INetworkInterfaceNode>;
  vnet(): IVirtualNetworkNode;
  nsg(): INetworkSecurityGroupNode | undefined;
}

export interface INetworkInterfaceNode extends IAzureGraphNode {
  subnet(): ISubnetNode;
  ips(): IterableIterator<IpNode>;
  nsg(): INetworkSecurityGroupNode | undefined;
}

export interface INetworkSecurityGroupNode extends IAzureGraphNode {
  convertRules(vnetSymbol: string): NSGRuleSpecs;
}

export interface ILoadBalancerFrontEndIpNode extends IAzureGraphNode {
  ip(): IpNode;
}

export interface ILoadBalancerBackendPoolNode extends IAzureGraphNode {
  ips(): IterableIterator<IpNode>;
  subnet(): ISubnetNode;
}

export interface ILoadBalancerRuleNode extends IAzureGraphNode {
  frontEndIp(): ILoadBalancerFrontEndIpNode;
  backendPool(): ILoadBalancerBackendPoolNode;
  convertToRoute(): RoutingRuleSpec;
}

export interface ILoadBalancerNATRule extends IAzureGraphNode {
  frontEndIp(): ILoadBalancerFrontEndIpNode;
  backEnd(): IpNode;
  convertToRoute(): RoutingRuleSpec;
}

export interface ILoadBalancerNode extends IAzureGraphNode {
  balancingRules(): IterableIterator<ILoadBalancerRuleNode>;
  natRules(): IterableIterator<ILoadBalancerNATRule>;
}

export interface IVirutalMachineScaleSetNode extends IAzureGraphNode {
  getSubnet(vmssIds: AzureVMSSIpResult): ISubnetNode;
  readonly interfaceConfigs: AzureVmssNetworkInterfaceConfig[];
}

export type IVmssVirutalIpNode = IpNode;

export type IVmssVirtualNicNode = INetworkInterfaceNode;

export interface IpNode extends IAzureGraphNode {
  readonly ipAddress: string;
  subnet(): ISubnetNode;
}
