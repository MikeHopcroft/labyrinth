import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {
  AzureSubnet,
  convertVNet,
  GraphServices,
} from '../../../src/conversion/azure2';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  subnet1,
  subnet1SourceIps,
  subnet2,
  subnet2SourceIps,
  vnet1,
  vnet1SourceIps,
} from './sample_resource_graph';

export default function test() {
  describe('convertVNet()', () => {
    it('VNet with two subnets', () => {
      const {services, mocks} = createGraphServicesMock();
      mocks.subnet.action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (services: GraphServices, subnetSpec: AzureSubnet, parent: string) => {
          return {
            key: subnetSpec.id,
            destinationIp: subnetSpec.properties.addressPrefix,
          };
        }
      );

      // DESIGN NOTE: cannot call services.convert.vnet()  because our intent
      // is to test the real convertVNet(), instead of its mock.
      const result = convertVNet(services, vnet1);
      const {nodes: observedNodes} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.key, vnet1.id);
      assert.equal(result.destinationIp, vnet1SourceIps);

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
      const expectedNodes: NodeSpec[] = [
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
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });
  });
}
