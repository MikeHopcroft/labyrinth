import {ActionType, RuleSpec} from '../../../src';

import {
  AnyAzureObject,
  AzureLocalIP,
  AzureNetworkInterface,
  AzureObjectBase,
  AzureObjectIndex,
  AzureObjectType,
  AzurePublicIP,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureVirtualNetwork,
  GraphServices,
  IConverters,
  SymbolTable,
} from '../../../src/conversion/azure2';

import {createMock} from './mocks';

///////////////////////////////////////////////////////////////////////////////
//
// Factories
//
///////////////////////////////////////////////////////////////////////////////
export function createGraphServicesMock() {
  const fake: IConverters = {} as IConverters;

  const mocks = {
    ip: createMock(fake.ip),
    nic: createMock(fake.nic),
    nsg: createMock(fake.nsg),
    resourceGraph: createMock(fake.resourceGraph),
    subnet: createMock(fake.subnet),
    vnet: createMock(fake.vnet),
  };

  const symbols = new SymbolTable([]);
  const index = new AzureObjectIndex([]);
  const services = new GraphServices(mocks, symbols, index);

  return {services, mocks};
}

///////////////////////////////////////////////////////////////////////////////
//
// Names and ids
//
///////////////////////////////////////////////////////////////////////////////
export const resourceGroup = 'anyResourceGroup';
export const subscription = '00000000-0000-0000-0000-000000000000';

export const vnet1Name = 'vnet1';
export const vnet1Id = vnetId(vnet1Name);
export const vnet1SourceIps = '10.0.0.0/16';

export const nsg1Name = 'nsg1';
export const nsg1Id = nsgId(nsg1Name);

export const subnet1Name = 'subnet1';
export const subnet1Id = subnetId(vnet1Id, subnet1Name);
export const subnet1SourceIps = '10.0.0.0/8';

export const subnet2Name = 'subnet2';
export const subnet2Id = subnetId(vnet1Id, subnet2Name);
export const subnet2SourceIps = '10.0.1.0/8';

export const nic1Name = 'nic1';
export const nic1Id = nicId(nic1Name);

export const localIp1Name = 'localIp1';
export const localIp1Id = ipId(nic1Name, localIp1Name);
export const localIp1SourceIp = '10.0.0.1';
export const localIp1SubnetName = subnet1Name;

export const localIp2Name = 'localIp2';
export const localIp2Id = ipId(nic1Name, localIp2Name);
export const localIp2SourceIp = '10.0.0.2';
export const localIp2SubnetName = subnet1Name;

export const publicIp1Name = 'publicIp1';
export const publicIp1Id = ipId(nic1Name, publicIp1Name);
export const publicIp1SourceIp = '203.0.113.1';
export const publicIp1SubnetName = subnet1Name;

///////////////////////////////////////////////////////////////////////////////
//
// IP Configurations
//
///////////////////////////////////////////////////////////////////////////////
// TODO: should this be called `privateIp1`?
export const localIp1: AzureLocalIP = {
  type: AzureObjectType.LOCAL_IP,
  id: localIp1Id,
  name: localIp1Name,
  resourceGroup,
  properties: {
    privateIPAddress: localIp1SourceIp,
    subnet: reference(subnet1Id),
  },
};

export const localIp2: AzureLocalIP = {
  type: AzureObjectType.LOCAL_IP,
  id: localIp2Id,
  name: localIp2Name,
  resourceGroup,
  properties: {
    privateIPAddress: localIp2SourceIp,
    subnet: reference(subnet1Id),
  },
};

export const publicIp1: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIp1Id,
  name: publicIp1Name,
  resourceGroup,
  properties: {
    ipAddress: publicIp1SourceIp,
    subnet: reference(subnet1Id),
  },
};

///////////////////////////////////////////////////////////////////////////
//
// Subnets
//
///////////////////////////////////////////////////////////////////////////////
export const subnet1: AzureSubnet = {
  type: AzureObjectType.SUBNET,
  id: subnet1Id,
  name: subnet1Name,
  resourceGroup,
  properties: {
    addressPrefix: subnet1SourceIps,
    ipConfigurations: [localIp1, publicIp1],
    networkSecurityGroup: reference(nsg1Id),
  },
};

export const subnet2: AzureSubnet = {
  type: AzureObjectType.SUBNET,
  id: subnet2Id,
  name: subnet2Name,
  resourceGroup,
  properties: {
    addressPrefix: subnet2SourceIps,
    ipConfigurations: [],
    networkSecurityGroup: reference(nsg1Id),
  },
};

///////////////////////////////////////////////////////////////////////////////
//
// Network Security Groups
//
///////////////////////////////////////////////////////////////////////////////
export const inboundRules: RuleSpec[] = [
  {
    action: ActionType.ALLOW,
    priority: 1,
    id: 1,
    source: 'abc',
  },
];

export const outboundRules: RuleSpec[] = [
  {
    action: ActionType.DENY,
    priority: 2,
    id: 2,
    source: 'def',
  },
];

// Empty NSG associated with subnet1.
export const nsg1: AzureNetworkSecurityGroup = {
  type: AzureObjectType.NSG,
  id: nsg1Id,
  name: nsg1Name,
  resourceGroup,
  properties: {
    defaultSecurityRules: [],
    securityRules: [],
    subnets: [reference(subnet1Id)],
  },
};

///////////////////////////////////////////////////////////////////////////////
//
// Nics
//
///////////////////////////////////////////////////////////////////////////////
export const nic1: AzureNetworkInterface = {
  type: AzureObjectType.NIC,
  id: nic1Id,
  resourceGroup,
  properties: {
    ipConfigurations: [localIp1, localIp2],
    networkSecurityGroup: reference(nsg1),
  },
};

///////////////////////////////////////////////////////////////////////////////
//
// Virtual Networks
//
///////////////////////////////////////////////////////////////////////////////

export const vnet1: AzureVirtualNetwork = {
  type: AzureObjectType.VIRTUAL_NETWORK,
  id: vnet1Id,
  name: vnet1Name,
  resourceGroup,
  properties: {
    addressSpace: {
      addressPrefixes: [vnet1SourceIps],
    },
    subnets: [subnet1, subnet2],
  },
};

///////////////////////////////////////////////////////////////////////////////
//
// Convenience functions
//
///////////////////////////////////////////////////////////////////////////////

// DESIGN NOTE: for now there is only one subscription and one resource group.
function resourceGroupId() {
  return `/subscriptions/${subscription}/resourceGroups/${resourceGroup}/providers`;
}

function networkProvider() {
  return '/Microsoft.Network';
}

function vnetId(vnet: string) {
  return `${resourceGroupId()}${networkProvider()}/virtualNetworks/${vnet}`;
}

function subnetId(vnet: string, subnet: string) {
  return `${vnetId(vnet)}/subnets/${subnet}`;
}

function nsgId(name: string) {
  return (
    resourceGroupId() +
    `/providers/Microsoft.Network/networkSecurityGroups/${name}`
  );
}

function nicId(name: string) {
  return `${resourceGroupId()}${networkProvider()}/virtualInterfaces/${name}`;
}

function ipId(nic: string, ip: string) {
  return `${nicId(nic)}/ipConfigurations/${ip}`;
}

function reference(item: AnyAzureObject | string): AzureObjectBase {
  if (typeof item === 'string') {
    return {id: item, resourceGroup};
  } else {
    return {id: item.id, resourceGroup};
  }
}
