import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {
  AzureSubnet,
  convertVNet,
  GraphServices,
} from '../../../src/conversion/azure';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  subnet1,
  subnet1InboundKey,
  subnet1SourceIps,
  subnet2,
  subnet2InboundKey,
  subnet2SourceIps,
  vnet1,
  vnet1Symbol,
  vnet1SourceIps,
  vnet1InboundKey,
  publicIp1,
  privateIp1SourceIp,
  vnet1OutboundKey,
  vnet1RouterKey,
} from './sample_resource_graph';

export default function test() {
  describe('convertVNet()', () => {
    it('VNet with two subnets', () => {
      const {services, mocks} = createGraphServicesMock();
      mocks.subnet.action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          services: GraphServices,
          subnetSpec: AzureSubnet,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          parent: string,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          vnetSymbol: string
        ) => {
          let destination: string;
          if (subnetSpec === subnet1) {
            destination = subnet1InboundKey;
          } else if (subnetSpec === subnet2) {
            destination = subnet2InboundKey;
          } else {
            throw new TypeError('Unexpected subnet');
          }

          return {
            destination,
            constraints: {
              destinationIp: subnetSpec.properties.addressPrefix,
            },
          };
        }
      );

      // DESIGN NOTE: cannot call services.convert.vnet()  because our intent
      // is to test the real convertVNet(), instead of its mock.
      const outboundKey = 'parent';
      const result = convertVNet(services, vnet1, outboundKey, outboundKey)
        .route;
      const {nodes: observedNodes} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.destination, vnet1RouterKey);
      assert.equal(result.constraints.destinationIp, vnet1SourceIps);

      // Verify that subnetConverter() was invoked correctly.
      const log = mocks.subnet.log();
      assert.equal(log[0].params[1], subnet1);
      assert.equal(log[0].params[2], vnet1OutboundKey);
      assert.equal(log[0].params[3], vnet1Symbol);
      assert.equal(log[1].params[1], subnet2);
      assert.equal(log[1].params[2], vnet1OutboundKey);
      assert.equal(log[1].params[3], vnet1Symbol);

      // Verify the service tag definition.
      assert.deepEqual(services.symbols.getSymbolSpec(vnet1Symbol), {
        dimension: 'ip',
        symbol: vnet1Symbol,
        range: vnet1SourceIps,
      });

      // Verify that correct VNet node(s) were created in services.
      const expectedNodes: NodeSpec[] = [
        {
          key: vnet1InboundKey,
          name: vnet1.id,
          routes: [
            {
              destination: subnet1InboundKey,
              constraints: {
                destinationIp: subnet1SourceIps,
              },
            },
            {
              destination: subnet2InboundKey,
              constraints: {
                destinationIp: subnet2SourceIps,
              },
            },
          ],
        },
        {
          key: vnet1OutboundKey,
          name: vnet1.id,
          routes: [
            {
              destination: vnet1RouterKey,
              constraints: {
                destinationIp: `${vnet1SourceIps}`,
              },
            },
            {
              destination: outboundKey,
            },
          ],
        },
        {
          key: vnet1RouterKey,
          name: vnet1.id,
          range: {
            sourceIp: vnet1SourceIps,
          },
          routes: [
            {
              destination: vnet1InboundKey,
              constraints: {
                destinationIp: `${vnet1SourceIps}`,
              },
            },
          ],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });
  });

  it('Verify VNET Public IP Route', () => {
    const {services, mocks} = createGraphServicesMock();

    mocks.publicIp.action(() => {
      return {
        inbound: [
          {
            destination: 'public-inbound',
          },
        ],
        outbound: [
          {
            destination: 'public-outbound',
          },
        ],
      };
    });

    mocks.subnet.action(() => {
      return {
        destination: 'subnet-route',
        constraints: {
          destinationIp: privateIp1SourceIp,
        },
      };
    });

    services.index.addReference(publicIp1, vnet1);

    const outboundKey = 'parent';
    convertVNet(services, vnet1, outboundKey, outboundKey);
    const vnetNode = services.nodes.get(vnet1OutboundKey);

    const expectedRoutes = [
      {
        constraints: {
          destinationIp: `${vnet1SourceIps}`,
        },
        destination: vnet1RouterKey,
      },
      {
        destination: 'public-outbound',
      },
      {
        destination: 'parent',
      },
    ];

    assert.deepEqual(vnetNode?.routes, expectedRoutes);
  });
}
