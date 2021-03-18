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
  privateIp1,
  privateIp2,
  privateIp1Id,
  privateIp2Id,
  privateIp1Name,
  privateIp2Name,
  privateIp1SourceIp,
  privateIp2SourceIp,
  nic1,
  nic1Id,
  nsg1,
  outboundRules,
  subnet1Id,
  vnet1Id,
} from './sample_resource_graph';

export default function test() {
  describe('convertNIC()', () => {
    it('NIC with NSG and two private ips', () => {
      const {services, mocks} = createGraphServicesMock();

      // convertNIC() expects to find its nsg spec in the index.
      services.index.add(nsg1);

      mocks.ip.action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (services: GraphServices, ipSpec: AzureIPConfiguration) => {
          if (ipSpec.name === privateIp1Name) {
            return {
              destination: privateIp1Id,
              constraints: {destinationIp: privateIp1SourceIp},
            };
          } else if (ipSpec.name === privateIp2Name) {
            return {
              destination: privateIp2Id,
              constraints: {destinationIp: privateIp2SourceIp},
            };
          } else {
            throw new TypeError('Unknown ip configuration');
          }
        }
      );

      mocks.nsg.action(
        (nsgSpec: AzureNetworkSecurityGroup | undefined): NSGRuleSpecs => {
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
      assert.equal(result.destination, 'nic1/inbound');
      assert.equal(
        result.constraints.destinationIp,
        `${privateIp1SourceIp},${privateIp2SourceIp}`
      );

      // Verify that ipConverter() was invoked correctly.
      const ipLog = mocks.ip.log();
      assert.equal(ipLog.length, 2);
      assert.equal(ipLog[0].params[1], privateIp1);
      assert.equal(ipLog[1].params[1], privateIp2);

      // Verify that nsgConverter() was invoked correctly.
      const nsgLog = mocks.nsg.log();
      assert.equal(nsgLog.length, 1);
      assert.equal(nsgLog[0].params[0], nsg1);
      assert.equal(nsgLog[0].params[1], vnet1Id);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify that correct nodes were created.
      const expectedNodes: NodeSpec[] = [
        // Inbound
        {
          key: 'nic1/inbound',
          name: nic1Id + '/inbound',
          filters: inboundRules,
          routes: [
            {
              destination: privateIp1Id,
              constraints: {
                destinationIp: privateIp1SourceIp,
              },
            },
            {
              destination: privateIp2Id,
              constraints: {
                destinationIp: privateIp2SourceIp,
              },
            },
          ],
        },

        // Outbound
        {
          key: 'nic1/outbound',
          name: nic1Id + '/outbound',
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
