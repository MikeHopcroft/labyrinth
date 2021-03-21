import {ActionType, RuleSpec} from '../../../src';

import {
  AnyAzureObject,
  AzurePrivateIP,
  AzureNetworkInterface,
  AzureObjectBase,
  AzureObjectIndex,
  AzureObjectType,
  AzurePublicIP,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureVirtualMachine,
  AzureVirtualNetwork,
  GraphServices,
  IConverters,
  NodeServices,
} from '../../../src/conversion/azure';

import {createMock} from './mocks';

///////////////////////////////////////////////////////////////////////////////
//
// Factories
//
///////////////////////////////////////////////////////////////////////////////
const nodeServices = new NodeServices();

export function createGraphServicesMock() {
  const fake: IConverters = {} as IConverters;

  const mocks = {
    ip: createMock(fake.ip),
    nic: createMock(fake.nic),
    nsg: createMock(fake.nsg),
    publicIp: createMock(fake.publicIp),
    resourceGraph: createMock(fake.resourceGraph),
    subnet: createMock(fake.subnet),
    vnet: createMock(fake.vnet),
    vm: createMock(fake.vm),
  };

  const index = new AzureObjectIndex([]);
  const nodes = new NodeServices();
  const services = new GraphServices(index, {converters: mocks, nodes});

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
export const subnet1Id = subnetId(vnet1Name, subnet1Name);
export const subnet1SourceIps = '10.0.0.0/8';

export const subnet2Name = 'subnet2';
export const subnet2Id = subnetId(vnet1Name, subnet2Name);
export const subnet2SourceIps = '10.0.1.0/8';

export const nic1Name = 'nic1';
export const nic1Id = nicId(nic1Name);

export const privateIp1Name = 'privateIp1';
export const privateIp1Id = ipId(nic1Name, privateIp1Name);
export const privateIp1SourceIp = '10.0.0.1';
export const privateIp1SubnetName = subnet1Name;

export const privateIp2Name = 'privateIp2';
export const privateIp2Id = ipId(nic1Name, privateIp2Name);
export const privateIp2SourceIp = '10.0.0.2';
export const privateIp2SubnetName = subnet1Name;

export const publicIp1Name = 'publicIp1';
export const publicIp1Id = ipId(nic1Name, publicIp1Name);
export const publicIp1SourceIp = '203.0.113.1';
export const publicIp1SubnetName = subnet1Name;

export const publicIpWithPrivateName = 'publicIpWithPrivateIp1';
export const publicIpWithPrivateId = publicIpId(publicIpWithPrivateName);
export const publicIpWithPrivateSourceIp = '203.0.113.1';

export const privateIpWithPublicName = 'privateIpWithPublic1';
export const privateIpWithPublicId = ipId(nic1Name, publicIpWithPrivateName);

export const vm1Name = 'vm1';
export const vm1Id = vmId(vm1Name);

///////////////////////////////////////////////////////////////////////////////
//
// IP Configurations
//
///////////////////////////////////////////////////////////////////////////////
// TODO: should this be called `privateIp1`?
export const privateIp1: AzurePrivateIP = {
  type: AzureObjectType.PRIVATE_IP,
  id: privateIp1Id,
  name: privateIp1Name,
  resourceGroup,
  properties: {
    privateIPAddress: privateIp1SourceIp,
    subnet: reference(subnet1Id),
  },
};
export const privateIp1Key = nodeServices.createKey(privateIp1);

export const privateIp2: AzurePrivateIP = {
  type: AzureObjectType.PRIVATE_IP,
  id: privateIp2Id,
  name: privateIp2Name,
  resourceGroup,
  properties: {
    privateIPAddress: privateIp2SourceIp,
    subnet: reference(subnet1Id),
  },
};
export const privateIp2Key = nodeServices.createKey(privateIp2);

export const publicIp1: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIp1Id,
  name: publicIp1Name,
  resourceGroup,
  properties: {
    ipAddress: publicIp1SourceIp,
  },
};
export const publicIp1Key = nodeServices.createKey(publicIp1);

export const privateIpWithPublic: AzurePrivateIP = {
  type: AzureObjectType.PRIVATE_IP,
  id: privateIpWithPublicId,
  name: privateIpWithPublicName,
  resourceGroup,
  properties: {
    privateIPAddress: privateIp1SourceIp,
    subnet: reference(subnet1Id),
    publicIPAddress: reference(publicIpWithPrivateId),
  },
};
export const privateIpWithPublicKey = nodeServices.createKey(
  privateIpWithPublic
);

export const publicIpWithPrivate: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIpWithPrivateId,
  name: publicIpWithPrivateName,
  resourceGroup,
  properties: {
    ipAddress: publicIpWithPrivateSourceIp,
    ipConfiguration: reference(privateIpWithPublic),
  },
};
export const publicIpWithPrivateKey = nodeServices.createKey(
  publicIpWithPrivate
);

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
    ipConfigurations: [privateIp1, publicIp1],
    networkSecurityGroup: reference(nsg1Id),
  },
};
const subnet1Key = nodeServices.createKey(subnet1);
export const subnet1InboundKey = nodeServices.createKeyVariant(
  subnet1Key,
  'inbound'
);
export const subnet1OutboundKey = nodeServices.createKeyVariant(
  subnet1Key,
  'outbound'
);

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
const subnet2Key = nodeServices.createKey(subnet2);
export const subnet2InboundKey = nodeServices.createKeyVariant(
  subnet2Key,
  'inbound'
);
export const subnet2OutboundKey = nodeServices.createKeyVariant(
  subnet2Key,
  'outbound'
);

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
export const nsg1Key = nodeServices.createKey(nsg1);

///////////////////////////////////////////////////////////////////////////////
//
// Virtual Machines
//
///////////////////////////////////////////////////////////////////////////////
export const vm1: AzureVirtualMachine = {
  type: AzureObjectType.VIRTUAL_MACHINE,
  id: vm1Id,
  name: vm1Name,
  resourceGroup,
};
export const vm1Key = nodeServices.createKey(vm1);

///////////////////////////////////////////////////////////////////////////////
//
// Nics
//
///////////////////////////////////////////////////////////////////////////////
export const nic1: AzureNetworkInterface = {
  type: AzureObjectType.NIC,
  id: nic1Id,
  name: nic1Name,
  resourceGroup,
  properties: {
    ipConfigurations: [privateIp1, privateIp2],
    networkSecurityGroup: reference(nsg1),
    virtualMachine: reference(vm1),
  },
};
const nic1Key = nodeServices.createKey(nic1);
export const nic1InboundKey = nodeServices.createKeyVariant(nic1Key, 'inbound');
export const nic1OutboundKey = nodeServices.createKeyVariant(
  nic1Key,
  'outbound'
);

export const nicWithoutVm: AzureNetworkInterface = {
  type: AzureObjectType.NIC,
  id: nic1Id,
  name: nic1Name,
  resourceGroup,
  properties: {
    ipConfigurations: [privateIp1, privateIp2],
    networkSecurityGroup: reference(nsg1),
  },
};
export const nicWithoutVmKey = nodeServices.createKey(nicWithoutVm);

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
export const vnet1Key = nodeServices.createKey(vnet1);
export const vnet1Symbol = vnet1Key;

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

function publicIpId(name: string) {
  return `${resourceGroupId()}${networkProvider()}/publicIpAddresses/${name}`;
}

function ipId(nic: string, ip: string) {
  return `${nicId(nic)}/ipConfigurations/${ip}`;
}

function vmId(name: string) {
  return `${resourceGroupId()}Microsoft.Compute/virtualMachines/${name}`;
}

function reference(item: AnyAzureObject | string): AzureObjectBase {
  if (typeof item === 'string') {
    return {id: item, resourceGroup};
  } else {
    return {id: item.id, resourceGroup};
  }
}
