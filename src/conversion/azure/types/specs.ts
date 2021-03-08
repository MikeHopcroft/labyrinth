///////////////////////////////////////////////////////////////////////////////
//
// Type system skeleton for Azure resource graph.
//
// The resource graph is an AzureObjectBase[].
//
//
// Here's one way to get the resource graph for the resource group
// called "labyringth-sample"
//
// # Install the CLI extension
// az extension add --name resource-graph
//
// # Run a query to get everything (note: this is Kusto syntax)
// az graph query -q 'resources | where resourceGroup == "labyrinth-sample"'
//
///////////////////////////////////////////////////////////////////////////////
// TODO: better names for AzureIdReference and AzureObjectBase.
export interface AzureObjectBase {
  id: string;
  resourceGroup: string;
}

export interface AzureTypedObject extends AzureObjectBase {
  name: string;
  type: string;
}

// DESIGN NOTE: the unused type parameter T is for the benefit of
// a generic function that dereferences an AzureReference<T> into
// a T.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type AzureReference<T> = AzureObjectBase;

export enum AzureObjectType {
  DEFAULT_SECURITY_RULE = 'microsoft.network/networksecuritygroups/defaultsecurityrules',
  LOCAL_IP = 'microsoft.network/networkinterfaces/ipconfigurations',
  PUBLIC_IP = 'microsoft.network/publicipaddresses',
  NIC = 'microsoft.network/networkinterfaces',
  NSG = 'microsoft.network/networksecuritygroups',
  SECURITY_RULE = 'microsoft.network/networksecuritygroups/securityrules',
  SUBNET = 'microsoft.network/virtualnetworks/subnets',
  VIRTUAL_NETWORK = 'microsoft.network/virtualnetworks',
  VIRTUAL_MACHINE_SCALE_SET = 'microsoft.compute/virtualmachinescalesets',
  VMSS_VIRTUAL_IP = 'microsoft.compute/virtualmachinescalesets/virtual.ip',
  VMSS_VIRTUAL_NIC = 'microsoft.compute/virtualmachinescalesets/virtual.nic',
  LOAD_BALANCER_BACKEND_POOL = 'microsoft.network/loadbalancers/backendaddresspools',
  LOAD_BALANCER_FRONT_END_IP = 'microsoft.network/loadbalancers/frontendipconfigurations',
  LOAD_BALANCER_NAT_POOL_INBOUND = 'microsoft.network/loadbalancers/inboundnatpools',
  LOAD_BALANCER_NAT_RULE_INBOUND = 'microsoft.network/loadbalancers/inboundnatrules',
  LOAD_BALANCER_RULE = 'microsoft.network/loadbalancers/loadbalancingrules',
  LOAD_BALANCER = 'microsoft.network/loadbalancers',
}

export interface AzureVMSSVirtualIp extends AzureTypedObject {
  type: AzureObjectType.VMSS_VIRTUAL_IP;
}

export interface AzureVMSSVirtualNic extends AzureTypedObject {
  type: AzureObjectType.VMSS_VIRTUAL_NIC;
}

export interface AzureLocalIP extends AzureTypedObject {
  type: AzureObjectType.LOCAL_IP;
  properties: {
    privateIPAddress: string;
    subnet: AzureReference<AzureSubnet> | undefined;
  };
}

export interface AzurePublicIp extends AzureTypedObject {
  type: AzureObjectType.PUBLIC_IP;
  properties: {
    ipAddress: string;
    subnet: AzureObjectBase | undefined;
  };
}

export function isLocalIp(spec: AzureTypedObject): spec is AzureLocalIP {
  return spec.type.toLowerCase() === AzureObjectType.LOCAL_IP;
}

export type AzureIPConfiguration = AzureLocalIP | AzurePublicIp;

export interface AzureNetworkInterface extends AzureTypedObject {
  type: AzureObjectType.NIC;
  properties: {
    ipConfigurations: AzureIPConfiguration[];
    networkSecurityGroup: AzureReference<AzureNetworkSecurityGroup>;
  };
}

export function asAzureNetworkInterface(
  item: AnyAzureObject
): AzureNetworkInterface | null {
  return item.type === AzureObjectType.NIC ? item : null;
}

export interface AzureNetworkSecurityGroup extends AzureTypedObject {
  type: AzureObjectType.NSG;
  properties: {
    defaultSecurityRules: AzureSecurityRule[];
    securityRules: AzureSecurityRule[];
    subnets: AzureReference<AzureSubnet>[];
  };
}

export interface AzureSecurityRule extends AzureTypedObject {
  type: AzureObjectType.DEFAULT_SECURITY_RULE | AzureObjectType.SECURITY_RULE;
  properties: {
    access: 'Allow' | 'Deny';
    destinationAddressPrefix: string;
    destinationAddressPrefixes: string[];
    destinationPortRange: string;
    destinationPortRanges: string[];
    direction: 'Inbound' | 'Outbound';
    priority: number;
    protocol: string;
    sourceAddressPrefix: string;
    sourceAddressPrefixes: string[];
    sourcePortRange: string;
    sourcePortRanges: string[];
  };
}

export interface AzureSubnet extends AzureTypedObject {
  type: AzureObjectType.SUBNET;
  properties: {
    addressPrefix: string;
    ipConfigurations: AzureReference<AzureIPConfiguration>[];
    networkSecurityGroup: AzureReference<AzureNetworkSecurityGroup>;
    // TODO: privateEndpoints
  };
}

export interface AzureVirtualNetwork extends AzureTypedObject {
  type: AzureObjectType.VIRTUAL_NETWORK;
  properties: {
    addressSpace: {
      addressPrefixes: string[];
    };
    subnets: AzureSubnet[];
    // TODO: virtualNetworkPeerings
  };
}

export function asAzureVirtualNetwork(
  item: AnyAzureObject
): AzureVirtualNetwork | null {
  return item.type === AzureObjectType.VIRTUAL_NETWORK ? item : null;
}

export interface AzureVmssIpConfiguration {
  name: string;
  properties: {
    subnet: AzureReference<AzureSubnet>;
  };
}

export interface AzureVmssNetworkInterfaceConfig {
  name: string;
  properties: {
    ipConfigurations: AzureVmssIpConfiguration[];
    networkSecurityGroup: AzureReference<AzureNetworkSecurityGroup>;
  };
}

export interface AzureVirtualMachineScaleSet extends AzureTypedObject {
  type: AzureObjectType.VIRTUAL_MACHINE_SCALE_SET;
  properties: {
    virtualMachineProfile: {
      networkProfile: {
        networkInterfaceConfigurations: AzureVmssNetworkInterfaceConfig[];
      };
    };
  };
}

export interface AzureLoadBalancerBackendPool extends AzureTypedObject {
  type: AzureObjectType.LOAD_BALANCER_BACKEND_POOL;
  properties: {
    backendIPConfigurations: AzureReference<AzureIPConfiguration>[];
    loadBalancingRules: AzureReference<AzureLoadBalancerRule>[];
  };
}

export interface AzureLoadBalancerFrontEndIp extends AzureTypedObject {
  type: AzureObjectType.LOAD_BALANCER_FRONT_END_IP;
  properties: {
    inboundNatPools: AzureReference<AzureLoadBalancerInboundNatPool>[];
    inboundNatRules: AzureReference<AzureLoadBalancerInboundNatRule>[];
    loadBalancingRules: AzureReference<AzureLoadBalancerRule>[];
    publicIPAddress: AzureReference<AzurePublicIp>;
  };
}

export interface AzureLoadBalancerInboundNatPool extends AzureTypedObject {
  type: AzureObjectType.LOAD_BALANCER_NAT_POOL_INBOUND;
  properties: {
    backendPort: number;
    frontendIPConfiguration: AzureReference<AzureLoadBalancerFrontEndIp>;
    frontendPortRangeStart: number;
    frontendPortRangeEnd: number;
    protocol: string;
  };
}

export interface AzureLoadBalancerInboundNatRule extends AzureTypedObject {
  type: AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND;
  properties: {
    backendPort: number;
    backendIPConfiguration: AzureReference<AzureIPConfiguration>;
    frontendIPConfiguration: AzureReference<AzureLoadBalancerFrontEndIp>;
    frontendPort: number;
    protocol: string;
  };
}

export interface AzureLoadBalancerRule extends AzureTypedObject {
  type: AzureObjectType.LOAD_BALANCER_RULE;
  properties: {
    backendAddressPool: AzureReference<AzureLoadBalancerBackendPool>;
    backendPort: number;
    frontendIPConfiguration: AzureReference<AzureLoadBalancerFrontEndIp>;
    frontendPort: number;
    protocol: string;
  };
}

export interface AzureLoadBalancer extends AzureTypedObject {
  type: AzureObjectType.LOAD_BALANCER;
  properties: {
    backendAddressPools: AzureLoadBalancerBackendPool[];
    frontendIPConfigurations: AzureLoadBalancerFrontEndIp[];
    inboundNatPools: AzureLoadBalancerInboundNatPool[];
    inboundNatRules: AzureLoadBalancerInboundNatRule[];
    loadBalancingRules: AzureLoadBalancerRule[];
  };
}

export function asLoadBalancer(item: AnyAzureObject): AzureLoadBalancer | null {
  return item.type === AzureObjectType.LOAD_BALANCER ? item : null;
}

export type AnyAzureObject =
  | AzureIPConfiguration
  | AzureLoadBalancer
  | AzureLoadBalancerBackendPool
  | AzureLoadBalancerFrontEndIp
  | AzureLoadBalancerInboundNatPool
  | AzureLoadBalancerInboundNatRule
  | AzureLoadBalancerRule
  | AzureNetworkInterface
  | AzureNetworkSecurityGroup
  | AzureSecurityRule
  | AzureSubnet
  | AzureVirtualMachineScaleSet
  | AzureVMSSVirtualIp
  | AzureVMSSVirtualNic
  | AzureVirtualNetwork;

export type AzureResourceGraph = AnyAzureObject[];

export function asSpec<T extends AnyAzureObject>(
  spec: AnyAzureObject,
  type: AzureObjectType
): T {
  if (spec.type.toLowerCase() !== type) {
    throw new Error(`Invalid cast of "${spec.id}" to type "${type}"`);
  }

  return spec as T;
}
