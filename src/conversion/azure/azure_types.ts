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

// DESIGN NOTE: Azure resource graphs use an inconsistent mixture of upper and
// lower casing in the AzureTypedObject's `type` field. This codebase assumes
// lower case, meaning that the `type` fields in the resource graph must be
// down cased before attempting to generate a Labyrinth graph.
// See the normalizeCase() function.
//
// WARNING: when adding new values to the AzureObjectType enum, be sure to
// update the azureTypeNames array, below.
export enum AzureObjectType {
  DEFAULT_SECURITY_RULE = 'microsoft.network/networksecuritygroups/defaultsecurityrules',
  PRIVATE_IP = 'microsoft.network/networkinterfaces/ipconfigurations',
  PUBLIC_IP = 'microsoft.network/publicipaddresses',
  NIC = 'microsoft.network/networkinterfaces',
  NSG = 'microsoft.network/networksecuritygroups',
  SECURITY_RULE = 'microsoft.network/networksecuritygroups/securityrules',
  SUBNET = 'microsoft.network/virtualnetworks/subnets',
  VIRTUAL_NETWORK = 'microsoft.network/virtualnetworks',
  VIRTUAL_MACHINE = 'microsoft.compute/virtualmachines',
}

// Type names used for Labyrinth node key generation. See NodeKeyGenerator.
export const azureTypeNames = [
  [AzureObjectType.PRIVATE_IP, 'privateIp'],
  [AzureObjectType.PUBLIC_IP, 'publicIp'],
  [AzureObjectType.NIC, 'nic'],
  [AzureObjectType.NSG, 'nsg'],
  [AzureObjectType.SUBNET, 'subnet'],
  [AzureObjectType.VIRTUAL_NETWORK, 'vnet'],
  [AzureObjectType.VIRTUAL_MACHINE, 'vm'],
];

// TODO: should this be called AzurePrivateIp?
export interface AzurePrivateIP extends AzureTypedObject {
  type: AzureObjectType.PRIVATE_IP;
  // TODO: should there be a `name` field?
  properties: {
    privateIPAddress: string;
    // TODO: REVIEW: can subnet ever be undefined?
    subnet: AzureReference<AzureSubnet> | undefined;
    publicIPAddress?: AzureReference<AzurePublicIP>;
  };
}
export const AzurePrivateIP = {
  type: AzureObjectType.PRIVATE_IP,
} as AzurePrivateIP;

export interface AzurePublicIP extends AzureTypedObject {
  type: AzureObjectType.PUBLIC_IP;
  // TODO: should there be a `name` field?
  properties: {
    ipAddress: string;
    // TODO: REVIEW: can subnet ever be undefined?
    subnet: AzureReference<AzureSubnet> | undefined;
  };
}
export const AzurePublicIP = {type: AzureObjectType.PUBLIC_IP} as AzurePublicIP;

export type AzureIPConfiguration = AzurePrivateIP | AzurePublicIP;

export interface AzureNetworkInterface extends AzureTypedObject {
  type: AzureObjectType.NIC;
  // TODO: should there be a `name` field?
  properties: {
    ipConfigurations: AzurePrivateIP[];
    networkSecurityGroup?: AzureReference<AzureNetworkSecurityGroup>;
    virtualMachine?: AzureReference<AzureVirtualMachine>;
  };
}
export const AzureNetworkInterface = {
  type: AzureObjectType.NIC,
} as AzureNetworkInterface;

export interface AzureNetworkSecurityGroup extends AzureTypedObject {
  type: AzureObjectType.NSG;
  properties: {
    defaultSecurityRules: AzureSecurityRule[];
    securityRules: AzureSecurityRule[];
    subnets: AzureReference<AzureSubnet>[];
  };
}
export const AzureNetworkSecurityGroup = {
  type: AzureObjectType.NSG,
} as AzureNetworkSecurityGroup;

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
export const AzureSecurityRule = {
  type: AzureObjectType.SECURITY_RULE,
} as AzureSecurityRule;

export interface AzureSubnet extends AzureTypedObject {
  type: AzureObjectType.SUBNET;
  properties: {
    addressPrefix: string;
    ipConfigurations: AzureReference<AzureIPConfiguration>[];
    networkSecurityGroup: AzureReference<AzureNetworkSecurityGroup>;
    // TODO: privateEndpoints
  };
}
export const AzureSubnet = {type: AzureObjectType.SUBNET} as AzureSubnet;

export interface AzureVirtualMachine extends AzureTypedObject {
  type: AzureObjectType.VIRTUAL_MACHINE;
}

export const AzureVirtualMachine = {
  type: AzureObjectType.VIRTUAL_MACHINE,
} as AzureVirtualMachine;

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
export const AzureVirtualNetwork = {
  type: AzureObjectType.VIRTUAL_NETWORK,
} as AzureVirtualNetwork;

export type AnyAzureObject =
  | AzureIPConfiguration
  | AzureNetworkInterface
  | AzureNetworkSecurityGroup
  | AzureSecurityRule
  | AzureSubnet
  | AzureVirtualMachine
  | AzureVirtualNetwork;

export type AzureResourceGraph = AnyAzureObject[];
