import {assert} from 'chai';
import {setServers} from 'dns';
import 'mocha';
import {ActionType} from '../../../src';
import {convert} from '../../../src/conversion/azure2/convert';

import {ServiceOracle} from './oracle';
import {ResourceGraphOracle} from './oracle_data';

describe('Azure', () => {
  describe('Convert-VNET', () => {
    it('Basic Virtual Network Conversion', () => {
      const expected = {
        nodes: [
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
                constraints: {destinationIp: 'except 172.18.0.0/28'},
                destination:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/outbound',
              },
            ],
          },
          {
            key:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A/outbound',
            filters: [],
            routes: [{destination: 'Internet'}],
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

      const graph = ResourceGraphOracle.ValidVnetGraph();
      const services = ServiceOracle.InitializedGraphServices(graph);

      for (const vnet of services.index.virtualNetworks()) {
        vnet.convert(services);
      }

      const nodeGraph = services.getLabyrinthGraphSpec();
      assert.deepEqual(nodeGraph, expected);
    });
  });

  it('Test Load Balancer', () => {
    const graph = ResourceGraphOracle.LoadBalancerGraph();
    const result = convert(graph);
    console.log(JSON.stringify(result));
  });
});
