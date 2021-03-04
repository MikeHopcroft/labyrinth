import {assert} from 'chai';
import 'mocha';
import {ActionType} from '../../../src';

import {ServiceOracle} from './oracle';
import {ResourceGraphOracle} from './oracle_data';

describe('Azure', () => {
  describe('Convert-VNET', () => {
    it('Basic Virtual Network Conversion', () => {
      const expected = {
        nodes: [
          {
            key:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/router',
            routes: [
              {
                constraints: {destinationIp: 'except 172.18.0.0/28'},
                destination:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/outbound',
              },
            ],
          },
          {
            key:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/inbound',
            filters: [
              {
                action: ActionType.ALLOW,
                priority: 65000,
                id: 1,
                source: 'data/azure/resource-graph-1.json',
                constraints: {
                  sourceIp:
                    '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
                  sourcePort: '*',
                  destinationIp:
                    '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
                  destinationPort: '*',
                  protocol: '*',
                },
              },
            ],
            routes: [
              {
                destination:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/router',
              },
            ],
          },
          {
            key:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/outbound',
            filters: [],
            routes: [
              {
                destination:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
              },
            ],
          },
          {
            key:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
            range: {sourceIp: '172.18.0.0/28'},
            routes: [
              {
                destination: 'Internet',
                constraints: {destinationIp: 'except 172.18.0.0/28'},
              },
              {
                destination:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/inbound',
                constraints: {destinationIp: '172.18.0.0/28'},
              },
            ],
          },
        ],
        symbols: [
          {
            dimension: 'ip',
            symbol:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
            range: '172.18.0.0/28',
          },
        ],
      };

      const vnetSpec = ResourceGraphOracle.ValidVnet();
      const graph = ResourceGraphOracle.ValidVnetGraph();
      const services = ServiceOracle.InitializedGraphServices(graph);

      services.convert.vnet(services, vnetSpec);
      const nodeGraph = services.getLabyrinthGraphSpec();
      console.log(JSON.stringify(nodeGraph));
      assert.deepEqual(nodeGraph, expected);
    });
  });
});
