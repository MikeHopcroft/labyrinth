import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  convertSubnet,
  GraphServices,
  NSGRuleSpecs,
} from '../../../src/conversion/azure2';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  inboundRules,
  nic1,
  nsg1,
  outboundRules,
  subnet1,
  subnet1SourceIps,
  vnet1Id,
} from './sample_resource_graph';

export default function test() {
  describe('convertSubnet()', () => {
    it('Subnet with one NIC', () => {
      const {services, mocks} = createGraphServicesMock();

      // convertSubnet() expects to find its nsg spec in the index.
      services.index.add(nsg1);

      // convertSubnet() expects to find references to its nics.
      services.index.addReference(nic1, subnet1);

      mocks.nic.action(
        (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          services: GraphServices,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          spec: AzureNetworkInterface,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          parent: string,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          vnetSymbol: string
        ) => {
          return {
            destination: 'foo2',
            constraints: {destinationIp: 'bar2'},
          };
        }
      );

      mocks.nsg.action(
        (
          nsgSpec: AzureNetworkSecurityGroup | undefined,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          vnetNodeKey: string
        ): NSGRuleSpecs => {
          if (nsgSpec === nsg1) {
            return {inboundRules, outboundRules};
          } else {
            throw 'Incorrect nsg spec';
          }
        }
      );

      // DESIGN NOTE: cannot call services.convert.vnet() because our intent
      // is to test the real convertVNet(), instead of its mock.
      const result = convertSubnet(services, subnet1, vnet1Id, vnet1Id);
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify the return value.
      assert.equal(result.destination, `${subnet1.id}/inbound`);
      assert.equal(result.constraints.destinationIp, subnet1SourceIps);

      // Verify that nicConverter() was invoked correctly.
      const log = mocks.nic.log();
      assert.equal(log.length, 1);
      assert.equal(log[0].params[1], nic1);
      assert.equal(log[0].params[2], `${subnet1.id}/outbound`);
      assert.equal(log[0].params[3], vnet1Id);

      // Verify that nsgConverter() was invoked correctly.
      const log2 = mocks.nsg.log();
      assert.equal(log2.length, 1);
      assert.equal(log2[0].params[0], nsg1);
      assert.equal(log2[0].params[1], vnet1Id);

      // Verify that correct nodes were created.
      const expectedNodes: NodeSpec[] = [
        // Router
        {
          key: `${subnet1.id}/router`,
          // range: {
          //   sourceIp: subnet1SourceIps,
          // },
          routes: [
            {
              destination: 'foo',
              constraints: {
                destinationIp: 'bar',
              },
            },
            {
              destination: `${subnet1.id}/outbound`,
              constraints: {
                destinationIp: `except ${subnet1SourceIps}`,
              },
            },
          ],
        },

        // Inbound
        {
          key: `${subnet1.id}/inbound`,
          filters: inboundRules,
          routes: [
            {
              destination: `${subnet1.id}/router`,
            },
          ],
        },

        // Outbound
        {
          key: `${subnet1.id}/outbound`,
          filters: outboundRules,
          routes: [
            {
              destination: vnet1Id,
            },
          ],
        },
      ];

      console.log(JSON.stringify(nodes, null, 2));

      assert.deepEqual(nodes, expectedNodes);
    });
  });
}
