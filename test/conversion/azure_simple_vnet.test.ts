import {assert} from 'chai';
import 'mocha';
import {ActionType} from '../../src';
import {AnyAzureObject, AzureConverter} from '../../src/conversion';

describe('Conversion - Azure Simple Vnet', () => {
  it('Single VNet with single default rule', () => {
    const expected = [
      {
        key: 'A/router',
        range: {
          sourceIp: '172.18.0.0/28',
        },
        rules: [
          {
            destination: 'A/outbound',
            destinationIp: 'except 172.18.0.0/28',
          },
        ],
      },
      {
        filters: [
          {
            action: ActionType.ALLOW,
            destinationIp: 'VNET-B',
            destinationPort: '*',
            id: 1,
            priority: 65000,
            protocol: '*',
            source: 'TODO-WasFileName',
            sourceIp: 'VNET-B',
            sourcePort: '*',
          },
        ],
        key: 'A/inbound',
        rules: [
          {
            destination: 'A/router',
          },
        ],
      },
      {
        filters: [],
        key: 'A/outbound',
        range: {
          sourceIp: '172.18.0.0/28',
        },
        rules: [
          {
            destination: 'VNET-B',
          },
        ],
      },
      {
        key: 'VNET-B',
        range: {
          sourceIp: '172.18.0.0/28',
        },
        rules: [
          {
            destination: 'Internet',
            destinationIp: 'except 172.18.0.0/28',
          },
          {
            destination: 'A/router',
            destinationIp: '172.18.0.0/28',
          },
        ],
      },
      {
        endpoint: true,
        key: 'Internet',
        range: {
          sourceIp: 'Internet',
        },
        rules: [
          {
            destination: 'VNET-B',
            destinationIp: 'VNET-B',
          },
        ],
      },
    ];

    const input = [
      {
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
              resourceGroup: 'testing-network-testing',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
          ],
          securityRules: [],
        },
        resourceGroup: 'testing-network-testing',
        type: 'microsoft.network/networksecuritygroups',
      },
      {
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
                networkSecurityGroup: {
                  id:
                    '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup',
                  resourceGroup: 'testing-network-testing',
                },
              },
              resourceGroup: 'testing-network-testing',
              type: 'Microsoft.Network/virtualNetworks/subnets',
            },
          ],
        },
        resourceGroup: 'testing-network-testing',
        type: 'microsoft.network/virtualnetworks',
      },
    ] as AnyAzureObject[];

    const converter = new AzureConverter();
    const graph = converter.Convert(input);
    assert.deepEqual(graph.nodes, expected);
  });
});
