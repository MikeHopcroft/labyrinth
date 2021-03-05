import {assert} from 'chai';
import 'mocha';
import {AzureSubnet, GraphSpec} from '../../../src';

import {convertVNet} from '../../../src/conversion/azure2/convert_vnet';
import {GraphServices} from '../../../src/conversion/azure2/graph_services';

// TODO: namespace this import
import {
  createConvertersMock,
  createGraphServices,
  subnet1,
  subnet1SourceIps,
  subnet2,
  subnet2SourceIps,
  vnet1,
  vnet1SourceIps,
} from './shared';

export default function test() {
  describe('convertVNet()', () => {
    it('VNet with two subnets', () => {
      const mocks = createConvertersMock();
      mocks.subnet.action(
        (services: GraphServices, subnetSpec: AzureSubnet, parent: string) => {
          return {
            key: subnetSpec.id,
            destinationIp: subnetSpec.properties.addressPrefix,
          };
        }
      );
      const services = createGraphServices(mocks);
      const result = convertVNet(services, vnet1);
      const observedGraphSpec = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.key, vnet1.id);
      // assert.equal(result.destinationIp, vnet1SourceIps);

      // Verify that subnetConverter() was invoked correctly.
      const log = mocks.subnet.log();
      assert.equal(log[0].params[1], subnet1);
      assert.equal(log[0].params[2], vnet1.id);
      assert.equal(log[1].params[1], subnet2);
      assert.equal(log[1].params[2], vnet1.id);

      // Verify the service tag definition.
      assert.deepEqual(services.symbols.getSymbolSpec(vnet1.id), {
        dimension: 'ip',
        symbol: vnet1.id,
        range: vnet1SourceIps,
      });

      // Verify that correct VNet node(s) were created in services.
      const expectedGraphSpec: GraphSpec = {
        nodes: [
          {
            key: vnet1.id,
            range: {
              sourceIp: vnet1SourceIps,
            },
            routes: [
              {
                destination: 'Internet',
                constraints: {
                  destinationIp: `except ${vnet1SourceIps}`,
                },
              },
              {
                destination: subnet1.id,
                constraints: {
                  destinationIp: subnet1SourceIps,
                },
              },
              {
                destination: subnet2.id,
                constraints: {
                  destinationIp: subnet2SourceIps,
                },
              },
            ],
          },
        ],
        symbols: [
          {
            dimension: 'ip',
            symbol: vnet1.id,
            range: vnet1SourceIps,
          },
        ],
      };

      assert.deepEqual(observedGraphSpec, expectedGraphSpec);
    });
  });
};
