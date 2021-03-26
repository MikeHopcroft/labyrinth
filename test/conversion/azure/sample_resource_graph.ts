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
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerInboundRule,
  AzureLoadBalancerBackendPool,
  ruleProtocol,
  AzureLoadBalancer,
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
    internalLoadBalancer: createMock(fake.internalLoadBalancer),
    loadBalancerFrontend: createMock(fake.loadBalancerFrontend),
    nic: createMock(fake.nic),
    nsg: createMock(fake.nsg),
    privateIp: createMock(fake.privateIp),
    publicIp: createMock(fake.publicIp),
    resourceGraph: createMock(fake.resourceGraph),
    subnet: createMock(fake.subnet),
    vnet: createMock(fake.vnet),
    vm: createMock(fake.vm),
  };

  // Need to clear out nodes from earlier runs.
  nodeServices.clearNodes();

  const index = new AzureObjectIndex([]);
  const services = new GraphServices(index, {
    converters: mocks,
    nodes: nodeServices,
  });

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
export const publicIpWithPrivateSourceIp = '203.0.113.2';

export const isolatedPublicIpName = 'isolatedPublicIp';
export const isolatedPublicIpId = publicIpId(isolatedPublicIpName);
export const isolatedPublicIpSourceIp = '203.0.113.3';

export const publicIpToFrontEndLoadBalancerName =
  'publicIpToFrontEndLoadBalancer';
export const publicIpToFrontEndLoadBalancerId = publicIpId(
  publicIpToFrontEndLoadBalancerName
);
export const publicIpToFrontEndLoadBalancerIp = '203.0.113.4';
export const privateIpToLoadBalancer = '10.0.0.3';

export const privateIpWithPublicName = 'privateIpWithPublic1';
export const privateIpWithPublicId = ipId(nic1Name, privateIpWithPublicName);

export const vm1Name = 'vm1';
export const vm1Id = vmId(vm1Name);

export const loadBalancer1Name = 'loadBalancer1';
export const loadBalancer1Id = loadBalancerId(loadBalancer1Name);

export const natRule1Name = 'natRule1';
export const natRule1Id = natRuleId(loadBalancer1Name, natRule1Name);

export const poolRule1Name = 'poolRule1';
export const poolRule1Id = poolRuleId(loadBalancer1Name, poolRule1Name);

export const backendPool1Name = 'backendPool';
export const backendPool1Id = backendPoolId(
  loadBalancer1Name,
  backendPool1Name
);

export const frontEndIp1Name = 'frontEndIp';
export const frontEndIp1Id = frontEndIpId(loadBalancer1Name, frontEndIp1Name);

///////////////////////////////////////////////////////////////////////////////
//
// Private IP Configurations
//
///////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////
//
// Public IP Configurations
//
///////////////////////////////////////////////////////////////////////////////
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

export const publicWithPrivateMissingAddress: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIpWithPrivateId,
  name: publicIpWithPrivateName,
  resourceGroup,
  properties: {},
};

const publicIpWithPrivateKey = nodeServices.createKey(publicIpWithPrivate);
export const publicIpWithPrivateInboundKey = nodeServices.createKeyVariant(
  publicIpWithPrivateKey,
  'inbound'
);
export const publicIpWithPrivateOutboundKey = nodeServices.createKeyVariant(
  publicIpWithPrivateKey,
  'outbound'
);

export const isolatedPublicIp: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: isolatedPublicIpId,
  name: isolatedPublicIpName,
  resourceGroup,
  properties: {
    ipAddress: isolatedPublicIpSourceIp,
  },
};
const isolatedPublicIpKey = nodeServices.createKey(isolatedPublicIp);
export const isolatedPublicIpInboundKey = nodeServices.createKeyVariant(
  isolatedPublicIpKey,
  'inbound'
);

export const publicIpToFrontEndLoadBalancer: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIpToFrontEndLoadBalancerId,
  name: publicIpToFrontEndLoadBalancerName,
  resourceGroup,
  properties: {
    ipAddress: publicIpToFrontEndLoadBalancerIp,
    ipConfiguration: reference(frontEndIp1Id),
  },
};
const publicIpToFrontEndLoadBalancerKey = nodeServices.createKey(
  publicIpToFrontEndLoadBalancer
);
export const publicIpToFrontEndLoadBalancerInboundKey = nodeServices.createKeyVariant(
  publicIpToFrontEndLoadBalancerKey,
  'inbound'
);

export const publicIpWithoutIp: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIpWithPrivateId,
  name: publicIpWithPrivateName,
  resourceGroup,
  properties: {},
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
export const vnet1KeyPrefix = nodeServices.createKey(vnet1);
export const vnet1Key = nodeServices.createKeyVariant(vnet1KeyPrefix, 'router');
export const vnet1KeyInbound = nodeServices.createKeyVariant(
  vnet1KeyPrefix,
  'inbound'
);
export const vnet1Symbol = vnet1KeyPrefix;

///////////////////////////////////////////////////////////////////////////////
//
// Load Balancer
//
///////////////////////////////////////////////////////////////////////////////
export const publicIpForLoadBalancer1: AzurePublicIP = {
  type: AzureObjectType.PUBLIC_IP,
  id: publicIp1Id,
  name: publicIp1Name,
  resourceGroup,
  properties: {
    ipAddress: publicIp1SourceIp,
    ipConfiguration: reference(frontEndIp1Id),
  },
};

export const natRule1: AzureLoadBalancerInboundNatRule = {
  type: AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND,
  id: natRule1Id,
  name: natRule1Name,
  resourceGroup,
  properties: {
    backendPort: 22,
    backendIPConfiguration: reference(privateIp1),
    frontendIPConfiguration: reference(frontEndIp1Id),
    frontendPort: 5000,
    protocol: ruleProtocol.TCP,
  },
};

const backendPoolIpConfigs = [privateIp1, privateIp2];
export const backendPool1: AzureLoadBalancerBackendPool = {
  type: AzureObjectType.LOAD_BALANCER_BACKEND_POOL,
  id: backendPool1Id,
  name: backendPool1Name,
  resourceGroup,
  properties: {
    // backendIPConfigurations: [reference(privateIp1), reference(privateIp2)],
    backendIPConfigurations: backendPoolIpConfigs.map(reference),
    loadBalancingRules: [reference(poolRule1Id)],
  },
};
export const backendPool1SourceIp = backendPoolIpConfigs
  .map(x => x.properties.privateIPAddress)
  .join(',');

export const poolRule1: AzureLoadBalancerInboundRule = {
  type: AzureObjectType.LOAD_BALANCER_RULE,
  id: poolRule1Id,
  name: poolRule1Name,
  resourceGroup,
  properties: {
    backendPort: 22,
    backendAddressPool: reference(backendPool1),
    frontendIPConfiguration: reference(frontEndIp1Id),
    frontendPort: 5000,
    protocol: ruleProtocol.TCP,
  },
};

export const frontEndIpWithNatRule: AzureLoadBalancerFrontEndIp = {
  type: AzureObjectType.LOAD_BALANCER_FRONT_END_IP,
  id: frontEndIp1Id,
  name: frontEndIp1Name,
  resourceGroup,
  properties: {
    inboundNatPools: [],
    inboundNatRules: [natRule1],
    loadBalancingRules: [],
    publicIPAddress: reference(publicIpForLoadBalancer1),
  },
};
// export const frontEndIp1IdKey = nodeServices.createKey(frontEndIpWithNatRule);
export const frontEndIpWithNatRuleKey = nodeServices.createKey(
  frontEndIpWithNatRule
);

export const frontEndIpWithPoolRule: AzureLoadBalancerFrontEndIp = {
  type: AzureObjectType.LOAD_BALANCER_FRONT_END_IP,
  id: frontEndIp1Id,
  name: frontEndIp1Name,
  resourceGroup,
  properties: {
    inboundNatPools: [],
    inboundNatRules: [],
    loadBalancingRules: [poolRule1],
    publicIPAddress: reference(publicIpForLoadBalancer1),
  },
};
export const frontEndIpWithPoolRuleKey = nodeServices.createKey(
  frontEndIpWithPoolRule
);

export const frontEndWithPrivateIp: AzureLoadBalancerFrontEndIp = {
  type: AzureObjectType.LOAD_BALANCER_FRONT_END_IP,
  id: frontEndIp1Id,
  name: frontEndIp1Name,
  resourceGroup,
  properties: {
    inboundNatPools: [],
    inboundNatRules: [],
    loadBalancingRules: [poolRule1],
    privateIPAddress: privateIpToLoadBalancer,
  },
};

export const loadBalancer1: AzureLoadBalancer = {
  type: AzureObjectType.LOAD_BALANCER,
  id: loadBalancer1Id,
  name: loadBalancer1Name,
  resourceGroup,
  properties: {
    inboundNatPools: [],
    inboundNatRules: [],
    loadBalancingRules: [],
    backendAddressPools: [],
    frontendIPConfigurations: [frontEndWithPrivateIp],
  },
};
export const loadBalancer1Key = nodeServices.createKey(loadBalancer1);

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

function loadBalancerId(name: string) {
  return `${resourceGroupId()}${networkProvider()}/loadBalancers/${name}`;
}

function frontEndIpId(lbName: string, name: string) {
  return `${loadBalancerId(lbName)}/frontendIPConfigurations/${name}`;
}

function natRuleId(lbName: string, name: string) {
  return `${loadBalancerId(lbName)}/inboundNatRules/${name}`;
}

function poolRuleId(lbName: string, name: string) {
  return `${loadBalancerId(lbName)}/loadBalancingRules/${name}`;
}

function backendPoolId(lbName: string, name: string) {
  return `${loadBalancerId(lbName)}/backendAddressPools/${name}`;
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
