import {
  AnyAzureObject,
  AzureNetworkSecurityGroup,
  AzureObjectType,
  AzureVirtualNetwork,
} from '../../../src/conversion/azure2/types';

export class ResourceGraphOracle {
  static ValidVnet(): AzureVirtualNetwork {
    const vnet: AzureVirtualNetwork = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
      name: 'VNET-B',
      properties: {
        addressSpace: {
          addressPrefixes: ['172.18.0.0/28'],
        },
        subnets: [
          {
            id:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A',
            name: 'A',
            properties: {
              addressPrefix: '172.18.0.0/28',
              ipConfigurations: [],
              networkSecurityGroup: {
                id:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup',
                resourceGroup: 'testing-network-testing',
              },
            },
            resourceGroup: 'testing-network-testing',
            type: AzureObjectType.SUBNET,
          },
        ],
      },
      resourceGroup: 'testing-network-testing',
      type: AzureObjectType.VIRTUAL_NETWORK,
    };
    return vnet;
  }

  static ValidVnetGraph(): AnyAzureObject[] {
    const nsg: AzureNetworkSecurityGroup = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup',
      name: 'TestSecurityGroup',
      properties: {
        defaultSecurityRules: [
          {
            id:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup/defaultSecurityRules/AllowVnetInBound',
            name: 'AllowVnetInBound',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65000,
              protocol: '*',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'testing-network-testing',
            type: AzureObjectType.DEFAULT_SECURITY_RULE,
          },
        ],
        subnets: [],
        securityRules: [],
      },
      resourceGroup: 'testing-network-testing',
      type: AzureObjectType.NSG,
    };
    return [nsg, this.ValidVnet()];
  }
}
