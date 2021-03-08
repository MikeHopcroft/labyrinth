import {assert} from 'chai';
import 'mocha';
import {SymbolDefinitionSpec} from '../../../src';

// import {NodeKeyAndSourceIp} from './converters';

import {
  AzureLocalIP,
  AzureObjectType,
} from '../../../src/conversion/azure/types';

import {ServiceOracle} from './oracle';

describe('Azure', () => {
  describe('Convert-IP', () => {
    // We may have to do this init per test, if we have memoizing converters.
    const services = ServiceOracle.InitializedGraphServices();

    it('Conversion of local ip', () => {
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

      assert.fail(
        'Currently failing due to behavior change with Load Balancer Exploration'
      );

      // services.index.add(input);
      // const {key: ipKey, destinationIp} = services.convert.ip(services, input);

      // // TODO: is this assert too prescriptive? If enforces that the generated
      // // key is, in fact, input.id. This may be an implementation detail.
      // assert.equal(ipKey, input.id);
      // assert.equal(destinationIp, input.properties.privateIPAddress);
    });
  });
});