import {assert} from 'chai';
import 'mocha';

import {
  AzureLocalIP,
  AzureNetworkInterface,
  AzurePublicIp,
  AzureSubnet,
  EntityStore,
  getVnetId,
  LocalIpConverter,
  NetworkInterfaceConverter,
  PublicIpConverter,
  SubnetConverter,
} from '../../src/conversion';

import {NodeSpec} from '../../src/graph';

describe('Conversion - Convert Azure', () => {
  describe('NetworkInterface', () => {
    const nicConverter = NetworkInterfaceConverter;
    const input = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-cred-testing/providers/Microsoft.Network/networkInterfaces/testingcreds68',
      name: 'testingcreds68',
      properties: {
        ipConfigurations: [
          {
            id:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-cred-testing/providers/Microsoft.Network/networkInterfaces/testingcreds68/ipConfigurations/ipconfig1',
            name: 'ipconfig1',
            properties: {
              privateIPAddress: '192.168.200.4',
              subnet: undefined,
            },
            resourceGroup: 'testing-cred-testing',
            type: 'Microsoft.Network/networkInterfaces/ipConfigurations',
          },
        ],
        virtualMachine: {
          id:
            '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-cred-testing/providers/Microsoft.Compute/virtualMachines/testingcreds',
          resourceGroup: 'testing-cred-testing',
        },
      },
      resourceGroup: 'testing-cred-testing',
      type: 'microsoft.network/networkinterfaces',
    } as AzureNetworkInterface;

    it('Monikers for NIC with single ip', () => {
      const monikers = nicConverter.monikers(input);
      assert.equal(monikers[0].name, 'testingcreds68');
      assert.equal(monikers[1].name, 'testingcreds68/ipconfig1');
    });

    it('Conversion of NIC with single', () => {
      const store = new EntityStore();
      const expected: NodeSpec[] = [
        {
          endpoint: true,
          key: 'testingcreds68/ipconfig1',
          range: {
            sourceIp: '192.168.200.4',
          },
          routes: [],
        },
      ];

      for (const data of nicConverter.monikers(input)) {
        if (data.item) {
          store.registerEntity(data.item, data.name);
        }
      }
      const alias = nicConverter.convert(input, store);
      assert.deepEqual(alias, expected);
    });
  });

  describe('IpAddresses', () => {
    const entityStore = new EntityStore();
    const publicIp = PublicIpConverter;
    const localIp = LocalIpConverter;

    it('Public IP Conversion', () => {
      const input = {
        name: 'testPublicIp',
        resourceGroup: 'test',
        id:
          '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.Network/publicIPAddresses/testIp',
        properties: {
          ipAddress: '51.143.10.199',
        },
      } as AzurePublicIp;

      entityStore.registerEntity(input, `test/${input.name}`);
      const result = publicIp.convert(input, entityStore);

      assert.equal(result.length, 1);

      const ipNode = result[0];
      assert.equal(ipNode?.range?.sourceIp, '51.143.10.199');
    });

    it('Local IP Conversion', () => {
      const input = {
        name: 'testLoacalIp',
        resourceGroup: 'test',
        id:
          '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/providers/Microsoft.Network/networkInterfaces/frontend/ipConfigurations/testIp',
        properties: {
          privateIPAddress: '192.168.200.4',
        },
      } as AzureLocalIP;

      entityStore.registerEntity(input, `test/${input.name}`);
      const result = localIp.convert(input, entityStore);

      assert.equal(result.length, 1);

      const ipNode = result[0];
      assert.equal(ipNode?.range?.sourceIp, '192.168.200.4');
    });
  });

  describe('Subnet Conversionss', () => {
    const converter = SubnetConverter;
    const inputSubnet = {
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
    } as AzureSubnet;

    it('Extract VNET Id from Subnet Id', () => {
      const expected =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B';
      const input =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A';
      const result = getVnetId(input);
      assert.equal(result, expected);
    });

    it('Subnet monikers should be consistent', () => {
      const expected = [
        {
          item: inputSubnet,
          name: 'A/router',
        },
      ];

      const result = converter.monikers(inputSubnet);
      assert.deepEqual(result, expected);
    });
  });
});
