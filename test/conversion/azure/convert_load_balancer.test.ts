import {assert} from 'chai';
import 'mocha';

import {NodeSpec, RoutingRuleSpec} from '../../../src';
import {convertLoadBalancerFrontEndIp} from '../../../src/conversion/azure/convert_load_balancer';

import {
  backendPool1,
  backendPool1SourceIp,
  createGraphServicesMock,
  frontEndIpWithNatRule,
  frontEndIpWithNatRuleKey,
  frontEndIpWithPoolRule,
  frontEndIpWithPoolRuleKey,
  natRule1,
  poolRule1,
  privateIp1,
  privateIp2,
} from './sample_resource_graph';

export default function test() {
  describe('convertLoadBalancer()', () => {
    it('load balancer nat rule', () => {
      const {services} = createGraphServicesMock();

      services.index.add(privateIp1);
      services.index.add(natRule1);

      const backboneKey = 'test-backbone';
      const route = convertLoadBalancerFrontEndIp(
        services,
        frontEndIpWithNatRule,
        backboneKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify return value
      const expectedRoute: RoutingRuleSpec = {
        destination: frontEndIpWithNatRuleKey,
      };
      assert.deepEqual(route, expectedRoute);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: frontEndIpWithNatRuleKey,
          routes: [
            {
              destination: backboneKey,
              constraints: {
                destinationPort: natRule1.properties.frontendPort.toString(),
                protocol: natRule1.properties.protocol,
              },
              override: {
                destinationIp: privateIp1.properties.privateIPAddress,
                destinationPort: natRule1.properties.backendPort.toString(),
              },
            },
          ],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });

    it('load balancer pool rule', () => {
      const {services} = createGraphServicesMock();
      services.index.add(backendPool1);
      services.index.add(poolRule1);
      services.index.add(privateIp1);
      services.index.add(privateIp2);

      const backboneKey = 'test-backbone';
      const route = convertLoadBalancerFrontEndIp(
        services,
        frontEndIpWithPoolRule,
        backboneKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify return value
      const expectedRoute: RoutingRuleSpec = {
        destination: frontEndIpWithPoolRuleKey,
      };
      assert.deepEqual(route, expectedRoute);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: frontEndIpWithPoolRuleKey,
          routes: [
            {
              destination: backboneKey,
              constraints: {
                destinationPort: natRule1.properties.frontendPort.toString(),
                protocol: natRule1.properties.protocol,
              },
              override: {
                destinationIp: backendPool1SourceIp,
                destinationPort: natRule1.properties.backendPort.toString(),
              },
            },
          ],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });
  });
}
