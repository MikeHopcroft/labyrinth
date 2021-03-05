import {
  AnyAzureObject,
  AzureObjectBase,
  AzureObjectIndex,
  AzureObjectType,
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

///////////////////////////////////////////////////////////////////////////////
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
    ipConfigurations: [],
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

function vnetId(vnet: string) {
  return (
    resourceGroupId() + `/providers/Microsoft.Network/virtualNetworks/${vnet}`
  );
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

function reference(item: AnyAzureObject | string): AzureObjectBase {
  if (typeof item === 'string') {
    return {id: item, resourceGroup};
  } else {
    return {id: item.id, resourceGroup};
  }
}
