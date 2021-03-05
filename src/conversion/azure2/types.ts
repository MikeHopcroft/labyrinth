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
export interface AzureObjectBase {
  id: string;
  name: string;
  resourceGroup: string;
  type: string;
}

export interface AzureIdReference {
  id: string;
  resourceGroup: string;
}

// DESIGN NOTE: the unused type parameter T is for the benefit of
// a generic function that dereferences an AzureReference<T> into
// a T.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type AzureReference<T> = AzureIdReference;

export enum AzureObjectType {
  DEFAULT_SECURITY_RULE = 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
  LOCAL_IP = 'Microsoft.Network/networkInterfaces/ipConfigurations',
  PUBLIC_IP = 'microsoft.network/publicipaddresses',
  NIC = 'microsoft.network/networkinterfaces',
  NSG = 'microsoft.network/networksecuritygroups',
  SECURITY_RULE = 'Microsoft.Network/networkSecurityGroups/securityRules',
  SUBNET = 'Microsoft.Network/virtualNetworks/subnets',
  VIRTUAL_NETWORK = 'microsoft.network/virtualnetworks',
  VIRTUAL_MACHINE_SCALE_SET = 'microsoft.compute/virtualmachinescalesets',
  LOAD_BALANCER_BACKEND_POOL = 'Microsoft.Network/loadBalancers/backendAddressPools',
  LOAD_BALANCER_FRONT_END_IP = 'Microsoft.Network/loadBalancers/frontendIPConfigurations',
  LOAD_BALANCER_NAT_POOL_INBOUND = 'Microsoft.Network/loadBalancers/inboundNatPools',
  LOAD_BALANCER_NAT_RULE_INBOUND = 'Microsoft.Network/loadBalancers/inboundNatRules',
  LOAD_BALANCER_RULE = 'Microsoft.Network/loadBalancers/loadBalancingRules',
  LOAD_BALANCER = 'microsoft.network/loadbalancers',
}

export interface AzureLocalIP extends AzureObjectBase {
  type: AzureObjectType.LOCAL_IP;
  properties: {
    privateIPAddress: string;
    subnet: AzureIdReference | undefined;
  };
}

export interface AzurePublicIp extends AzureObjectBase {
  type: AzureObjectType.PUBLIC_IP;
  properties: {
    ipAddress: string;
    subnet: AzureIdReference | undefined;
  };
}

export type AzureIPConfiguration = AzureLocalIP | AzurePublicIp;

export interface AzureNetworkInterface extends AzureObjectBase {
  type: AzureObjectType.NIC;
  properties: {
    ipConfigurations: AzureIPConfiguration[];
  };
}

export function asAzureNetworkInterface(
  item: AnyAzureObject
): AzureNetworkInterface | null {
  return item.type === AzureObjectType.NIC ? item : null;
}

export interface AzureNetworkSecurityGroup extends AzureObjectBase {
  type: AzureObjectType.NSG;
  properties: {
    defaultSecurityRules: AzureSecurityRule[];
    securityRules: AzureSecurityRule[];
    subnets: AzureReference<AzureSubnet>[];
  };
}

export interface AzureSecurityRule extends AzureObjectBase {
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

export interface AzureSubnet extends AzureObjectBase {
  type: AzureObjectType.SUBNET;
  properties: {
    addressPrefix: string;
    ipConfigurations: AzureReference<AzureIPConfiguration>[];
    networkSecurityGroup: AzureReference<AzureNetworkSecurityGroup>;
    // TODO: privateEndpoints
  };
}

export interface AzureVirtualNetwork extends AzureObjectBase {
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

export interface AzureVirtualMachineScaleSet extends AzureObjectBase {
  type: AzureObjectType.VIRTUAL_MACHINE_SCALE_SET;
  properties: {
    virtualMachineProfile: {
      networkProfile: {
        networkInterfaceConfigurations: AzureVmssNetworkInterfaceConfig[];
      };
    };
  };
}

export interface AzureLoadBalancerBackendPool extends AzureObjectBase {
  type: AzureObjectType.LOAD_BALANCER_BACKEND_POOL;
  properties: {
    backendIPConfigurations: AzureReference<AzureIPConfiguration>[];
    loadBalancingRules: AzureReference<AzureLoadBalancerRule>[];
  };
}

export interface AzureLoadBalancerFrontEndIp extends AzureObjectBase {
  type: AzureObjectType.LOAD_BALANCER_FRONT_END_IP;
  properties: {
    inboundNatPools: AzureReference<AzureLoadBalancerInboundNatPool>[];
    inboundNatRules: AzureReference<AzureLoadBalancerInboundNatRule>[];
    loadBalancingRules: AzureReference<AzureLoadBalancerRule>[];
    publicIPAddress: AzureReference<AzurePublicIp>;
  };
}

export interface AzureLoadBalancerInboundNatPool extends AzureObjectBase {
  type: AzureObjectType.LOAD_BALANCER_NAT_POOL_INBOUND;
  properties: {
    backendPort: number;
    frontendIPConfiguration: AzureReference<AzureLoadBalancerFrontEndIp>;
    frontendPortRangeStart: number;
    frontendPortRangeEnd: number;
    protocol: string;
  };
}

export interface AzureLoadBalancerInboundNatRule extends AzureObjectBase {
  type: AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND;
  properties: {
    backendPort: number;
    backendIPConfiguration: AzureReference<AzureIPConfiguration>;
    frontendIPConfiguration: AzureReference<AzureLoadBalancerFrontEndIp>;
    frontendPort: number;
    protocol: string;
  };
}

export interface AzureLoadBalancerRule extends AzureObjectBase {
  type: AzureObjectType.LOAD_BALANCER_RULE;
  properties: {
    backendAddressPool: AzureReference<AzureLoadBalancerBackendPool>;
    backendPort: number;
    frontendIPConfiguration: AzureReference<AzureLoadBalancerFrontEndIp>;
    frontendPort: number;
    protocol: string;
  };
}

export interface AzureLoadBalancer extends AzureObjectBase {
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
  | AzureVirtualNetwork;

export type AzureResourceGraph = AnyAzureObject[];
