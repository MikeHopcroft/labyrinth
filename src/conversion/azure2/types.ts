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
// export interface AzureObjectBase {
//   id: string;
//   name: string;
//   resourceGroup: string;
//   type: string;
// }

// export interface AzureIdReference {
//   id: string;
//   resourceGroup: string;
// }
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
  DEFAULT_SECURITY_RULE = 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
  LOCAL_IP = 'Microsoft.Network/networkInterfaces/ipConfigurations',
  PUBLIC_IP = 'microsoft.network/publicipaddresses',
  NIC = 'microsoft.network/networkinterfaces',
  NSG = 'microsoft.network/networksecuritygroups',
  SECURITY_RULE = 'Microsoft.Network/networkSecurityGroups/securityRules',
  SUBNET = 'Microsoft.Network/virtualNetworks/subnets',
  VIRTUAL_NETWORK = 'microsoft.network/virtualnetworks',
}

// TODO: should this be called AzurePrivateIp?
export interface AzureLocalIP extends AzureTypedObject {
  type: AzureObjectType.LOCAL_IP;
  // TODO: should there be a `name` field?
  properties: {
    privateIPAddress: string;
    // TODO: REVIEW: can subnet ever be undefined?
    subnet: AzureReference<AzureSubnet> | undefined;
  };
}
export const AzureLocalIP = {type: AzureObjectType.LOCAL_IP} as AzureLocalIP;

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

export type AzureIPConfiguration = AzureLocalIP | AzurePublicIP;

export interface AzureNetworkInterface extends AzureObjectBase {
  type: AzureObjectType.NIC;
  // TODO: should there be a `name` field?
  properties: {
    ipConfigurations: AzureIPConfiguration[];
    networkSecurityGroup?: AzureReference<AzureNetworkSecurityGroup>;
  };
}
export const AzureNetworkInterface = {
  type: AzureObjectType.NIC,
} as AzureNetworkInterface;

// export function asAzureNetworkInterface(
//   item: AnyAzureObject
// ): AzureNetworkInterface | null {
//   return item.type === AzureObjectType.NIC ? item : null;
// }

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

// export function asAzureVirtualNetwork(
//   item: AnyAzureObject
// ): AzureVirtualNetwork | null {
//   return item.type === AzureObjectType.VIRTUAL_NETWORK ? item : null;
// }

export type AnyAzureObject =
  | AzureIPConfiguration
  | AzureNetworkInterface
  | AzureNetworkSecurityGroup
  | AzureSecurityRule
  | AzureSubnet
  | AzureVirtualNetwork;

export type AzureResourceGraph = AnyAzureObject[];