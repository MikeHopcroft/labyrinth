import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  convertNIC,
  GraphServices,
  NSGRuleSpecs,
} from '../../../src/conversion/azure2';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  inboundRules,
  localIp1,
  localIp2,
  localIp1Id,
  localIp2Id,
  localIp1Name,
  localIp2Name,
  localIp1SourceIp,
  localIp2SourceIp,
  nic1,
  nsg1,
  outboundRules,
  subnet1Id,
  vnet1Id,
} from './sample_resource_graph';

export default function test() {
  describe('convertNIC()', () => {
    it('NIC with NSG and two local ips', () => {
      const {services, mocks} = createGraphServicesMock();

      // convertNIC() expects to find its nsg spec in the index.
      services.index.add(nsg1);

      mocks.ip.action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (services: GraphServices, ipSpec: AzureIPConfiguration) => {
          if (ipSpec.name === localIp1Name) {
            return {
              destination: localIp1Id,
              constraints: {destinationIp: localIp1SourceIp},
            };
          } else if (ipSpec.name === localIp2Name) {
            return {
              destination: localIp2Id,
              constraints: {destinationIp: localIp2SourceIp},
            };
          } else {
            throw new TypeError('Unknown ip configuration');
          }
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

      // DESIGN NOTE: cannot call services.convert.nic() because our intent
      // is to test the real convertNIC(), instead of its mock.
      const result = convertNIC(services, nic1, subnet1Id, vnet1Id);
      const {nodes: observedNodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify result.
      assert.equal(result.destination, `${nic1.id}/inbound`);
      assert.equal(
        result.constraints.destinationIp,
        `${localIp1SourceIp},${localIp2SourceIp}`
      );

      // Verify that ipConverter() was invoked correctly.
      const log = mocks.ip.log();
      assert.equal(log.length, 2);
      assert.equal(log[0].params[1], localIp1);
      assert.equal(log[1].params[1], localIp2);

      // Verify that nsgConverter() was invoked correctly.
      const log2 = mocks.nsg.log();
      assert.equal(log2.length, 1);
      assert.equal(log2[0].params[0], nsg1);
      assert.equal(log2[0].params[1], vnet1Id);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify that correct nodes were created.
      const expectedNodes: NodeSpec[] = [
        // Router
        {
          key: `${nic1.id}/router`,
          routes: [
            {
              destination: localIp1Id,
              constraints: {
                destinationIp: localIp1SourceIp,
              },
            },
            {
              destination: localIp2Id,
              constraints: {
                destinationIp: localIp2SourceIp,
              },
            },
            {
              destination: `${nic1.id}/outbound`,
            },
          ],
        },

        // Inbound
        {
          key: `${nic1.id}/inbound`,
          filters: inboundRules,
          routes: [
            {
              destination: `${nic1.id}/router`,
            },
          ],
        },

        // Outbound
        {
          key: `${nic1.id}/outbound`,
          filters: outboundRules,
          routes: [
            {
              destination: subnet1Id,
            },
          ],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });
  });
}
