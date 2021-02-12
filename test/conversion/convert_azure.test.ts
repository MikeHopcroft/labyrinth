import {assert} from 'chai';
import 'mocha';
import {
  AzureLocalIP,
  AzureNetworkInterface,
  AzurePublicIp,
  EntityStore,
  LocalIpConverter,
  NetworkInterfaceConverter,
  PublicIpConverter,
  SubnetConverter,
} from '../../src/conversion';

describe('Conversion - Convert Azure', () => {
  describe('NetworkInterface', () => {
    const nicConverter = new NetworkInterfaceConverter();
    const store = new EntityStore();
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

    it('Aliases for NIC with single ip', () => {
      const aliases = nicConverter.aliases(input);
      assert.equal(aliases[0].alias, 'testingcreds68');
      assert.equal(aliases[1].alias, 'testingcreds68/ipconfig1');
    });

    it('Conversion of NIC with single ip is empty', () => {
      const alias = nicConverter.convert(input, store);
      assert.deepEqual(alias, emptyNodeSet);
    });
  });

  describe('IpAddresses', () => {
    const entityStore = new EntityStore();
    const publicIp = new PublicIpConverter();
    const localIp = new LocalIpConverter();

    it('Public IP Conversion', () => {
      const input = {
        name: 'testIp',
        resourceGroup: 'test',
        id:
          '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.Network/publicIPAddresses/testIp',
        properties: {
          ipAddress: '51.143.10.199',
        },
      } as AzurePublicIp;

      const result = publicIp.convert(input, entityStore);

      assert.equal(result.length, 1);

      const ipNode = result[0];
      assert.equal(ipNode?.range?.sourceIp, '51.143.10.199');
    });

    it('Local IP Conversion', () => {
      const input = {
        name: 'testIp',
        resourceGroup: 'test',
        id:
          '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.Network/publicIPAddresses/testIp',
        properties: {
          privateIPAddress: '192.168.200.4',
        },
      } as AzureLocalIP;

      const result = localIp.convert(input, entityStore);

      assert.equal(result.length, 1);

      const ipNode = result[0];
      assert.equal(ipNode?.range?.sourceIp, '192.168.200.4');
    });
  });

  describe('Subnet Conversionss', () => {
    it('Extract VNET Id from Subnet Id', () => {
      const expected =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B';
      const input =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A';
      const result = SubnetConverter.getVnetId(input);
      assert.equal(result, expected);
    });
  });
});
