import {assert} from 'chai';
import 'mocha';

import {NodeSpec, RoutingRuleSpec} from '../../../src';

import {convertVM} from '../../../src/conversion/azure';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  vm1,
  vm1InboundKey,
  vm1Id,
  vm1OutboundKey,
} from './sample_resource_graph';

export default function test() {
  describe('convertVM()', () => {
    it('VM with two NICs', () => {
      const {services} = createGraphServicesMock();

      const route1: RoutingRuleSpec = {
        destination: 'nicA',
        constraints: {sourceIp: '1.1.1.1'},
      };
      const route2: RoutingRuleSpec = {
        destination: 'nicB',
        constraints: {sourceIp: '2.2.2.2'},
      };

      // DESIGN NOTE: cannot call services.convert.vm() because our intent
      // is to test the real convertVM(), instead of its mock.
      const result1 = convertVM(services, vm1, route1);
      const result2 = convertVM(services, vm1, route2);

      const {nodes: observedNodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify result1.
      assert.equal(result1.destination, vm1InboundKey);
      assert.equal(result1.constraints, undefined);

      // Verify result2.
      assert.equal(result2.destination, vm1InboundKey);
      assert.equal(result2.constraints, undefined);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify that correct nodes were created.
      const expectedNodes: NodeSpec[] = [
        {
          endpoint: true,
          key: vm1InboundKey,
          name: vm1Id,
          routes: [],
        },
        {
          endpoint: true,
          key: vm1OutboundKey,
          name: `${vm1Id}/outbound`,
          routes: [route1, route2],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });
  });
}
