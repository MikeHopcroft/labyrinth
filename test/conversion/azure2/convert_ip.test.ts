import {assert} from 'chai';
import 'mocha';
import {SymbolDefinitionSpec} from '../../../src';

import {
  AzureLocalIP,
  AzureObjectType,
} from '../../../src/conversion/azure2/types';
import {ServiceOracle} from './oracle';

describe('Azure', () => {
  describe('Convert-IP', () => {
    const services = ServiceOracle.InitializedGraphServices();

    it('Conversion of local ip', () => {
      const expected: SymbolDefinitionSpec = {
        dimension: 'ip', // TODO use enum
        symbol:
          '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/providers/Microsoft.Network/networkInterfaces/frontend/ipConfigurations/testIp',
        range: '192.168.200.4',
      };

      const input: AzureLocalIP = {
        type: AzureObjectType.LOCAL_IP,
        name: 'testLoacalIp',
        resourceGroup: 'test',
        id:
          '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/providers/Microsoft.Network/networkInterfaces/frontend/ipConfigurations/testIp',
        properties: {
          privateIPAddress: '192.168.200.4',
          subnet: undefined,
        },
      };

      const ipKey = services.convert.ip(services, input);
      const symbol = services.symbols.getSymbol(ipKey);
      assert.deepEqual(symbol, expected);
    });
  });
});
