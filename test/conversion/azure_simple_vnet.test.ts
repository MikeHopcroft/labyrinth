import {assert} from 'chai';
import 'mocha';

import {AnyAzureObject, AzureConverter} from '../../src/conversion';
import {ActionType} from '../../src/rules';

describe('Conversion - Azure Simple Vnet', () => {
  it('Single VNet with single default rule', () => {
    const expected = [
      {
        key: 'A/router',
        range: {
          sourceIp: '172.18.0.0/28',
        },
        routes: [
          {
            destination: 'A/outbound',
            constraints: {
              destinationIp: 'except 172.18.0.0/28',
            },
          },
        ],
      },
      {
        filters: [
          {
            action: ActionType.ALLOW,
            constraints: {
              destinationIp: 'VNET-B',
              destinationPort: '*',
              protocol: '*',
              sourceIp: 'VNET-B',
              sourcePort: '*',
            },
            id: 1,
            priority: 65000,
            source: 'data/azure/resource-graph-1.json',
          },
        ],
        key: 'A/inbound',
        routes: [
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
        routes: [
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
        routes: [
          {
            destination: 'Internet',
            constraints: {
              destinationIp: 'except 172.18.0.0/28',
            },
          },
          {
            destination: 'A/inbound',
            constraints: {
              destinationIp: '172.18.0.0/28',
            },
          },
        ],
      },
      {
        endpoint: true,
        key: 'Internet',
        range: {
          sourceIp: 'Internet',
        },
        routes: [
          {
            destination: 'VNET-B',
            constraints: {
              destinationIp: 'VNET-B',
            },
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

    const graph = AzureConverter.convert(input.values());
    assert.deepEqual(graph.nodes, expected);
  });
});
