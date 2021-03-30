import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {convertNIC} from '../../../src/conversion/azure';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  inboundRules,
  privateIp1SourceIp,
  privateIp2SourceIp,
  nic1,
  nic1Id,
  nic1InboundKey,
  nic1OutboundKey,
  nicWithoutVm,
  nsg1,
  outboundRules,
  subnet1Id,
  subnet1OutboundKey,
  vnet1Id,
  vm1,
  vm1Key,
} from './sample_resource_graph';

export default function test() {
  describe('convertNIC()', () => {
    it('NIC with NSG and two private ips', () => {
      const {services, mocks} = createGraphServicesMock();

      // convertNIC() expects to find its nsg spec in the index.
      services.index.add(nsg1);
      services.index.add(vm1);

      mocks.nsg.action(() => {
        return {inboundRules, outboundRules};
      });

      mocks.vm.action(() => {
        return {
          destination: vm1Key,
        };
      });

      // DESIGN NOTE: cannot call services.convert.nic() because our intent
      // is to test the real convertNIC(), instead of its mock.
      const result = convertNIC(services, nic1, subnet1OutboundKey, vnet1Id);
      const {nodes: observedNodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify result.
      assert.equal(result.destination, nic1InboundKey);
      assert.equal(
        result.constraints.destinationIp,
        `${privateIp1SourceIp},${privateIp2SourceIp}`
      );

      // Verify that nsgConverter() was invoked correctly.
      const nsgLog = mocks.nsg.log();
      assert.equal(nsgLog.length, 1);
      assert.equal(nsgLog[0].params[1], nsg1);
      assert.equal(nsgLog[0].params[2], vnet1Id);

      // Verify that vmConverter() was invoked correctly.
      const vmLog = mocks.vm.log();
      assert.equal(vmLog.length, 1);
      assert.equal(vmLog[0].params[1], vm1);
      assert.deepEqual(vmLog[0].params[2], {
        destination: nic1OutboundKey,
        constraints: {sourceIp: `${privateIp1SourceIp},${privateIp2SourceIp}`},
      });

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify that correct nodes were created.
      const expectedNodes: NodeSpec[] = [
        // Inbound
        {
          key: nic1InboundKey,
          name: nic1Id + '/inbound',
          filters: inboundRules,
          routes: [
            {
              destination: vm1Key,
            },
          ],
        },

        // Outbound
        {
          key: nic1OutboundKey,
          name: nic1Id + '/outbound',
          filters: outboundRules,
          routes: [
            {
              destination: subnet1OutboundKey,
            },
          ],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });

    it('Mising VM should result in unbounded node', () => {
      const {services} = createGraphServicesMock();

      convertNIC(services, nicWithoutVm, subnet1Id, vnet1Id);
      const inboundNode = services.nodes.get(nic1InboundKey);
      assert.deepEqual(inboundNode, {
        key: nic1InboundKey,
        name: `${nic1Id}/inbound`,
        routes: [
          {
            destination: 'UnboundNetworkInterface',
          },
        ],
      });
    });
  });
}
