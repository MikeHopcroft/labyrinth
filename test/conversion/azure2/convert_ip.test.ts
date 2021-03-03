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
    // We may have to do this init per test, if we have memoizing converters.
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

      // Alternative form that emphasizes the semantics of the expected values.
      const expected2: SymbolDefinitionSpec = {
        dimension: 'ip', // TODO use enum
        symbol: input.id,
        range: input.properties.privateIPAddress,
      };

      const ipKey = services.convert.ip(services, input);

      // TODO: is this assert too prescriptive? If enforces that the generated
      // key is, in fact, input.id. This may be an implementation detail.
      assert.equal(ipKey, input.id);

      const symbol = services.symbols.getSymbolSpec(ipKey);
      assert.deepEqual(symbol, expected);

      // TODO: need to verify that the correct node is generated.
    });
  });
});