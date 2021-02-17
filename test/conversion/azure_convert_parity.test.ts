import {assert} from 'chai';
import 'mocha';
import {NodeSpec, SymbolDefinitionSpec} from '../../src';
import {AnyAzureObject, AzureConverter} from '../../src/conversion';

describe('Conversion - Azure Convert Parity', () => {
  const input = [
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a',
      identity: null,
      kind: '',
      location: 'westus2',
      managedBy: '',
      name: 'data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a',
      plan: null,
      properties: {
        dnsSettings: {
          appliedDnsServers: [],
          dnsServers: [],
          internalDomainNameSuffix:
            'xgse1231fvlunpshndvcwuhadc.xx.internal.cloudapp.net',
        },
        enableAcceleratedNetworking: false,
        enableIPForwarding: false,
        hostedWorkloads: [],
        ipConfigurations: [
          {
            etag: 'W/"06cd627e-6598-46c3-b4e6-84309b7692d3"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/ipConfigurations/blob-blob.privateEndpoint',
            name: 'blob-blob.privateEndpoint',
            properties: {
              primary: true,
              privateIPAddress: '10.0.1.4',
              privateIPAddressVersion: 'IPv4',
              privateIPAllocationMethod: 'Dynamic',
              privateLinkConnectionProperties: {
                fqdns: ['labyrinthjw2qpf.blob.core.windows.net'],
                groupId: 'blob',
                requiredMemberName: 'blob',
              },
              provisioningState: 'Succeeded',
              subnet: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/backendSubnet',
                resourceGroup: 'labyrinth-sample',
              },
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkInterfaces/ipConfigurations',
          },
        ],
        macAddress: '',
        nicType: 'Standard',
        privateEndpoint: {
          id:
            '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/privateEndpoints/data',
          resourceGroup: 'labyrinth-sample',
        },
        provisioningState: 'Succeeded',
        resourceGuid: 'ac089796-441a-48e9-b2e6-041c7ee1e754',
        tapConfigurations: [],
      },
      resourceGroup: 'labyrinth-sample',
      sku: null,
      subscriptionId: '6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b',
      tags: null,
      tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      type: 'microsoft.network/networkinterfaces',
      zones: null,
    },
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/frontend',
      identity: null,
      kind: '',
      location: 'westus2',
      managedBy: '',
      name: 'frontend',
      plan: null,
      properties: {
        dnsSettings: {
          appliedDnsServers: [],
          dnsServers: [],
        },
        enableAcceleratedNetworking: false,
        enableIPForwarding: false,
        hostedWorkloads: [],
        ipConfigurations: [
          {
            etag: 'W/"b332aa7d-ca2a-4fcd-9d16-0fa47f21ded4"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/frontend/ipConfigurations/default',
            name: 'default',
            properties: {
              primary: true,
              privateIPAddress: '10.0.0.132',
              privateIPAddressVersion: 'IPv4',
              privateIPAllocationMethod: 'Dynamic',
              provisioningState: 'Succeeded',
              publicIPAddress: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/publicIPAddresses/frontend',
                resourceGroup: 'labyrinth-sample',
              },
              subnet: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/frontendSubnet',
                resourceGroup: 'labyrinth-sample',
              },
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkInterfaces/ipConfigurations',
          },
        ],
        macAddress: '00-0D-3A-C3-49-92',
        nicType: 'Standard',
        primary: true,
        provisioningState: 'Succeeded',
        resourceGuid: '8a543935-4e91-4697-841e-c49270dd8602',
        tapConfigurations: [],
        virtualMachine: {
          id:
            '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Compute/virtualMachines/frontend',
          resourceGroup: 'labyrinth-sample',
        },
      },
      resourceGroup: 'labyrinth-sample',
      sku: null,
      subscriptionId: '6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b',
      tags: null,
      tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      type: 'microsoft.network/networkinterfaces',
      zones: null,
    },
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/jumpbox',
      identity: null,
      kind: '',
      location: 'westus2',
      managedBy: '',
      name: 'jumpbox',
      plan: null,
      properties: {
        dnsSettings: {
          appliedDnsServers: [],
          dnsServers: [],
        },
        enableAcceleratedNetworking: false,
        enableIPForwarding: false,
        hostedWorkloads: [],
        ipConfigurations: [
          {
            etag: 'W/"44a0f0cb-ee17-485e-8572-fe03bff91648"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/jumpbox/ipConfigurations/default',
            name: 'default',
            properties: {
              primary: true,
              privateIPAddress: '10.0.0.4',
              privateIPAddressVersion: 'IPv4',
              privateIPAllocationMethod: 'Dynamic',
              provisioningState: 'Succeeded',
              publicIPAddress: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/publicIPAddresses/jumpbox',
                resourceGroup: 'labyrinth-sample',
              },
              subnet: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/jumpboxSubnet',
                resourceGroup: 'labyrinth-sample',
              },
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkInterfaces/ipConfigurations',
          },
        ],
        macAddress: '00-0D-3A-FB-52-08',
        nicType: 'Standard',
        primary: true,
        provisioningState: 'Succeeded',
        resourceGuid: 'a7f0844c-a7c7-42e0-9744-cddd05cd1959',
        tapConfigurations: [],
        virtualMachine: {
          id:
            '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/LABYRINTH-SAMPLE/providers/Microsoft.Compute/virtualMachines/jumpbox',
          resourceGroup: 'LABYRINTH-SAMPLE',
        },
      },
      resourceGroup: 'labyrinth-sample',
      sku: null,
      subscriptionId: '6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b',
      tags: null,
      tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      type: 'microsoft.network/networkinterfaces',
      zones: null,
    },
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG',
      identity: null,
      kind: '',
      location: 'westus2',
      managedBy: '',
      name: 'backendNSG',
      plan: null,
      properties: {
        defaultSecurityRules: [
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/defaultSecurityRules/AllowVnetInBound',
            name: 'AllowVnetInBound',
            properties: {
              access: 'Allow',
              description: 'Allow inbound traffic from all VMs in VNET',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65000,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/defaultSecurityRules/AllowAzureLoadBalancerInBound',
            name: 'AllowAzureLoadBalancerInBound',
            properties: {
              access: 'Allow',
              description: 'Allow inbound traffic from azure load balancer',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65001,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'AzureLoadBalancer',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/defaultSecurityRules/DenyAllInBound',
            name: 'DenyAllInBound',
            properties: {
              access: 'Deny',
              description: 'Deny all inbound traffic',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65500,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/defaultSecurityRules/AllowVnetOutBound',
            name: 'AllowVnetOutBound',
            properties: {
              access: 'Allow',
              description:
                'Allow outbound traffic from all VMs to all VMs in VNET',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65000,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/defaultSecurityRules/AllowInternetOutBound',
            name: 'AllowInternetOutBound',
            properties: {
              access: 'Allow',
              description: 'Allow outbound traffic from all VMs to Internet',
              destinationAddressPrefix: 'Internet',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65001,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/defaultSecurityRules/DenyAllOutBound',
            name: 'DenyAllOutBound',
            properties: {
              access: 'Deny',
              description: 'Deny all outbound traffic',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65500,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
        ],
        provisioningState: 'Succeeded',
        resourceGuid: 'c163ff91-24da-4393-9266-d04716a9da38',
        securityRules: [
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/securityRules/allow_jumpbox',
            name: 'allow_jumpbox',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '443',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 1000,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '10.0.0.0/25',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/securityRules/allow_frontend',
            name: 'allow_frontend',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '443',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 1100,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '10.0.0.128/25',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
          {
            etag: 'W/"c23da840-dd32-4125-af4e-7e698d753d6c"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG/securityRules/block_outbound',
            name: 'block_outbound',
            properties: {
              access: 'Deny',
              destinationAddressPrefix: 'Internet',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 1000,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
        ],
        subnets: [
          {
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/backendSubnet',
            resourceGroup: 'labyrinth-sample',
          },
        ],
      },
      resourceGroup: 'labyrinth-sample',
      sku: null,
      subscriptionId: '6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b',
      tags: null,
      tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      type: 'microsoft.network/networksecuritygroups',
      zones: null,
    },
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG',
      identity: null,
      kind: '',
      location: 'westus2',
      managedBy: '',
      name: 'frontendNSG',
      plan: null,
      properties: {
        defaultSecurityRules: [
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/defaultSecurityRules/AllowVnetInBound',
            name: 'AllowVnetInBound',
            properties: {
              access: 'Allow',
              description: 'Allow inbound traffic from all VMs in VNET',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65000,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/defaultSecurityRules/AllowAzureLoadBalancerInBound',
            name: 'AllowAzureLoadBalancerInBound',
            properties: {
              access: 'Allow',
              description: 'Allow inbound traffic from azure load balancer',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65001,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'AzureLoadBalancer',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/defaultSecurityRules/DenyAllInBound',
            name: 'DenyAllInBound',
            properties: {
              access: 'Deny',
              description: 'Deny all inbound traffic',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65500,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/defaultSecurityRules/AllowVnetOutBound',
            name: 'AllowVnetOutBound',
            properties: {
              access: 'Allow',
              description:
                'Allow outbound traffic from all VMs to all VMs in VNET',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65000,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/defaultSecurityRules/AllowInternetOutBound',
            name: 'AllowInternetOutBound',
            properties: {
              access: 'Allow',
              description: 'Allow outbound traffic from all VMs to Internet',
              destinationAddressPrefix: 'Internet',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65001,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/defaultSecurityRules/DenyAllOutBound',
            name: 'DenyAllOutBound',
            properties: {
              access: 'Deny',
              description: 'Deny all outbound traffic',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65500,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
        ],
        provisioningState: 'Succeeded',
        resourceGuid: 'cf3f4efc-e7a6-49ca-8ce0-493590738d08',
        securityRules: [
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/securityRules/allow_http',
            name: 'allow_http',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '80',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 1000,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'Internet',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
          {
            etag: 'W/"96e30a2b-49be-40d8-b1e9-0c2335322d09"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG/securityRules/allow_https',
            name: 'allow_https',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '443',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 1100,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'Internet',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
        ],
        subnets: [
          {
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/frontendSubnet',
            resourceGroup: 'labyrinth-sample',
          },
        ],
      },
      resourceGroup: 'labyrinth-sample',
      sku: null,
      subscriptionId: '6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b',
      tags: null,
      tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      type: 'microsoft.network/networksecuritygroups',
      zones: null,
    },
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG',
      identity: null,
      kind: '',
      location: 'westus2',
      managedBy: '',
      name: 'jumpboxNSG',
      plan: null,
      properties: {
        defaultSecurityRules: [
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/defaultSecurityRules/AllowVnetInBound',
            name: 'AllowVnetInBound',
            properties: {
              access: 'Allow',
              description: 'Allow inbound traffic from all VMs in VNET',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65000,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/defaultSecurityRules/AllowAzureLoadBalancerInBound',
            name: 'AllowAzureLoadBalancerInBound',
            properties: {
              access: 'Allow',
              description: 'Allow inbound traffic from azure load balancer',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65001,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'AzureLoadBalancer',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/defaultSecurityRules/DenyAllInBound',
            name: 'DenyAllInBound',
            properties: {
              access: 'Deny',
              description: 'Deny all inbound traffic',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65500,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/defaultSecurityRules/AllowVnetOutBound',
            name: 'AllowVnetOutBound',
            properties: {
              access: 'Allow',
              description:
                'Allow outbound traffic from all VMs to all VMs in VNET',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65000,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/defaultSecurityRules/AllowInternetOutBound',
            name: 'AllowInternetOutBound',
            properties: {
              access: 'Allow',
              description: 'Allow outbound traffic from all VMs to Internet',
              destinationAddressPrefix: 'Internet',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65001,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/defaultSecurityRules/DenyAllOutBound',
            name: 'DenyAllOutBound',
            properties: {
              access: 'Deny',
              description: 'Deny all outbound traffic',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Outbound',
              priority: 65500,
              protocol: '*',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: '*',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
        ],
        provisioningState: 'Succeeded',
        resourceGuid: '5ac56165-9244-4dd7-9b99-82414ae51c89',
        securityRules: [
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/securityRules/allow_ssh',
            name: 'allow_ssh',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '22',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 1000,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'Internet',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
          {
            etag: 'W/"885a17a6-fd7c-48b7-9518-e160e5ff8be0"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG/securityRules/allow_https',
            name: 'allow_https',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: '*',
              destinationAddressPrefixes: [],
              destinationPortRange: '443',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 1100,
              protocol: 'Tcp',
              provisioningState: 'Succeeded',
              sourceAddressPrefix: 'Internet',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
        ],
        subnets: [
          {
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/jumpboxSubnet',
            resourceGroup: 'labyrinth-sample',
          },
        ],
      },
      resourceGroup: 'labyrinth-sample',
      sku: null,
      subscriptionId: '6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b',
      tags: null,
      tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      type: 'microsoft.network/networksecuritygroups',
      zones: null,
    },
    {
      id:
        '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet',
      name: 'vnet',
      properties: {
        addressSpace: {
          addressPrefixes: ['10.0.0.0/23'],
        },
        subnets: [
          {
            etag: 'W/"6510caa9-63e8-4dcd-9e71-5cfdb3f06145"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/jumpboxSubnet',
            name: 'jumpboxSubnet',
            properties: {
              addressPrefix: '10.0.0.0/25',
              delegations: [],
              ipConfigurations: [
                {
                  id:
                    '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/jumpbox/ipConfigurations/default',
                  resourceGroup: 'labyrinth-sample',
                },
              ],
              networkSecurityGroup: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/jumpboxNSG',
                resourceGroup: 'labyrinth-sample',
              },
              privateEndpointNetworkPolicies: 'Enabled',
              privateLinkServiceNetworkPolicies: 'Enabled',
              provisioningState: 'Succeeded',
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
          {
            etag: 'W/"6510caa9-63e8-4dcd-9e71-5cfdb3f06145"',
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/frontendSubnet',
            name: 'frontendSubnet',
            properties: {
              addressPrefix: '10.0.0.128/25',
              delegations: [],
              ipConfigurations: [
                {
                  id:
                    '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/frontend/ipConfigurations/default',
                  resourceGroup: 'labyrinth-sample',
                },
              ],
              networkSecurityGroup: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/frontendNSG',
                resourceGroup: 'labyrinth-sample',
              },
              privateEndpointNetworkPolicies: 'Enabled',
              privateLinkServiceNetworkPolicies: 'Enabled',
              provisioningState: 'Succeeded',
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
          {
            id:
              '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/virtualNetworks/vnet/subnets/backendSubnet',
            name: 'backendSubnet',
            properties: {
              addressPrefix: '10.0.1.0/24',
              ipConfigurations: [
                {
                  id:
                    '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkInterfaces/data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/ipConfigurations/blob-blob.privateEndpoint',
                  resourceGroup: 'labyrinth-sample',
                },
              ],
              networkSecurityGroup: {
                id:
                  '/subscriptions/6c1f4f3b-f65f-4667-8f9e-b9c48e09cd6b/resourceGroups/labyrinth-sample/providers/Microsoft.Network/networkSecurityGroups/backendNSG',
                resourceGroup: 'labyrinth-sample',
              },
            },
            resourceGroup: 'labyrinth-sample',
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
        ],
      },
      resourceGroup: 'labyrinth-sample',
      type: 'microsoft.network/virtualnetworks',
    },
  ] as AnyAzureObject[];

  it('Symbols are correct', () => {
    const expected = [
      {
        dimension: 'ip',
        symbol: 'Internet',
        range: 'except vnet',
      },
      {
        dimension: 'ip',
        symbol: 'AzureLoadBalancer',
        range: '168.63.129.16',
      },
      {
        dimension: 'protocol',
        symbol: 'Tcp',
        range: 'tcp',
      },
      {
        dimension: 'ip',
        symbol: 'vnet',
        range: '10.0.0.0/23',
      },
    ] as SymbolDefinitionSpec[];

    const graph = AzureConverter.convert(input.values());
    assert.deepEqual(graph.symbols, expected);
  });

  it('Nodes are correct', () => {
    const expected = [
      {
        key:
          'data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/blob-blob.privateEndpoint',
        endpoint: true,
        range: {
          sourceIp: '10.0.1.4',
        },
        rules: [
          {
            destination: 'backendSubnet/router',
            destinationIp: 'backendSubnet/router',
          },
        ],
      },
      {
        key: 'frontend/default',
        endpoint: true,
        range: {
          sourceIp: '10.0.0.132',
        },
        rules: [
          {
            destination: 'frontendSubnet/router',
            destinationIp: 'frontendSubnet/router',
          },
        ],
      },
      {
        key: 'jumpbox/default',
        endpoint: true,
        range: {
          sourceIp: '10.0.0.4',
        },
        rules: [
          {
            destination: 'jumpboxSubnet/router',
            destinationIp: 'jumpboxSubnet/router',
          },
        ],
      },
      {
        key: 'jumpboxSubnet/router',
        range: {
          sourceIp: '10.0.0.0/25',
        },
        rules: [
          {
            destination: 'jumpboxSubnet/outbound',
            destinationIp: 'except 10.0.0.0/25',
          },
          {
            destination: 'jumpbox/default',
            destinationIp: '10.0.0.4',
          },
        ],
      },
      {
        key: 'jumpboxSubnet/inbound',
        filters: [
          {
            action: 'allow',
            priority: 65000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'vnet',
            sourcePort: '*',
            destinationIp: 'vnet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 65001,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'AzureLoadBalancer',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 65500,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 1000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'Internet',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '22',
            protocol: 'Tcp',
          },
          {
            action: 'allow',
            priority: 1100,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'Internet',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '443',
            protocol: 'Tcp',
          },
        ],
        rules: [
          {
            destination: 'jumpboxSubnet/router',
          },
        ],
      },
      {
        key: 'jumpboxSubnet/outbound',
        filters: [
          {
            action: 'allow',
            priority: 65000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'vnet',
            sourcePort: '*',
            destinationIp: 'vnet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 65001,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: 'Internet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 65500,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
        ],
        range: {
          sourceIp: '10.0.0.0/25',
        },
        rules: [
          {
            destination: 'vnet',
          },
        ],
      },
      {
        key: 'frontendSubnet/router',
        range: {
          sourceIp: '10.0.0.128/25',
        },
        rules: [
          {
            destination: 'frontendSubnet/outbound',
            destinationIp: 'except 10.0.0.128/25',
          },
          {
            destination: 'frontend/default',
            destinationIp: '10.0.0.132',
          },
        ],
      },
      {
        key: 'frontendSubnet/inbound',
        filters: [
          {
            action: 'allow',
            priority: 65000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'vnet',
            sourcePort: '*',
            destinationIp: 'vnet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 65001,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'AzureLoadBalancer',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 65500,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 1000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'Internet',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '80',
            protocol: 'Tcp',
          },
          {
            action: 'allow',
            priority: 1100,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'Internet',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '443',
            protocol: 'Tcp',
          },
        ],
        rules: [
          {
            destination: 'frontendSubnet/router',
          },
        ],
      },
      {
        key: 'frontendSubnet/outbound',
        filters: [
          {
            action: 'allow',
            priority: 65000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'vnet',
            sourcePort: '*',
            destinationIp: 'vnet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 65001,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: 'Internet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 65500,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
        ],
        range: {
          sourceIp: '10.0.0.128/25',
        },
        rules: [
          {
            destination: 'vnet',
          },
        ],
      },
      {
        key: 'backendSubnet/router',
        range: {
          sourceIp: '10.0.1.0/24',
        },
        rules: [
          {
            destination: 'backendSubnet/outbound',
            destinationIp: 'except 10.0.1.0/24',
          },
          {
            destination:
              'data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/blob-blob.privateEndpoint',
            destinationIp: '10.0.1.4',
          },
        ],
      },
      {
        key: 'backendSubnet/inbound',
        filters: [
          {
            action: 'allow',
            priority: 65000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'vnet',
            sourcePort: '*',
            destinationIp: 'vnet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 65001,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'AzureLoadBalancer',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 65500,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 1000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '10.0.0.0/25',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '443',
            protocol: 'Tcp',
          },
          {
            action: 'allow',
            priority: 1100,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '10.0.0.128/25',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '443',
            protocol: 'Tcp',
          },
        ],
        rules: [
          {
            destination: 'backendSubnet/router',
          },
        ],
      },
      {
        key: 'backendSubnet/outbound',
        filters: [
          {
            action: 'allow',
            priority: 65000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: 'vnet',
            sourcePort: '*',
            destinationIp: 'vnet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'allow',
            priority: 65001,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: 'Internet',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 65500,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: '*',
            destinationPort: '*',
            protocol: '*',
          },
          {
            action: 'deny',
            priority: 1000,
            id: 1,
            source: 'data/azure/resource-graph-1.json',
            sourceIp: '*',
            sourcePort: '*',
            destinationIp: 'Internet',
            destinationPort: '*',
            protocol: 'Tcp',
          },
        ],
        range: {
          sourceIp: '10.0.1.0/24',
        },
        rules: [
          {
            destination: 'vnet',
          },
        ],
      },
      {
        key: 'vnet',
        range: {
          sourceIp: '10.0.0.0/23',
        },
        rules: [
          {
            destination: 'Internet',
            destinationIp: 'except 10.0.0.0/23',
          },
          {
            destination: 'jumpboxSubnet/inbound',
            destinationIp: '10.0.0.0/25',
          },
          {
            destination: 'frontendSubnet/inbound',
            destinationIp: '10.0.0.128/25',
          },
          {
            destination: 'backendSubnet/inbound',
            destinationIp: '10.0.1.0/24',
          },
        ],
      },
      {
        key: 'Internet',
        endpoint: true,
        range: {
          sourceIp: 'Internet',
        },
        rules: [
          {
            destination: 'vnet',
            destinationIp: 'vnet',
          },
        ],
      },
    ] as NodeSpec[];

    const graph = AzureConverter.convert(input.values());
    assert.deepEqual(graph.nodes, expected);
  });
});
