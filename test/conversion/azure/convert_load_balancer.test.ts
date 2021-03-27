import {assert} from 'chai';
import 'mocha';

import {NodeSpec, RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../../src';
import {convertLoadBalancer} from '../../../src/conversion/azure/convert_load_balancer';

import {
  backendPool1,
  createGraphServicesMock,
  loadBalancer1,
  loadBalancerNoRules,
  loadBalancerWithNatRule,
  loadBalancerWithNatRuleKey,
  natRule1,
  poolRule1,
  privateIp1,
  privateIp1SourceIp,
  privateIp2,
  privateIp2SourceIp,
  privateIpToLoadBalancer,
  publicIp1,
  publicIp1SourceIp,
} from './sample_resource_graph';

export default function test() {
  describe('convertLoadBalancer()', () => {
    it('Unconfigured return undefined', () => {
      const {services} = createGraphServicesMock();

      const route = convertLoadBalancer(
        services,
        loadBalancerNoRules,
        'unused'
      );
      assert.equal(undefined, route);
    });

    it('load balancer nat rule', () => {
      const {services} = createGraphServicesMock();

      services.index.add(publicIp1);
      services.index.add(privateIp1);
      services.index.add(natRule1);
      services.index.add(poolRule1);

      const subnetKey = 'test-subnet';
      const route = convertLoadBalancer(
        services,
        loadBalancerWithNatRule,
        subnetKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify return value
      const expectedRoute: SimpleRoutingRuleSpec = {
        destination: loadBalancerWithNatRuleKey,
        constraints: {
          destinationIp: publicIp1SourceIp,
        },
      };
      assert.deepEqual(route, expectedRoute);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: loadBalancerWithNatRuleKey,
          routes: [
            {
              destination: subnetKey,
              constraints: {
                destinationIp: publicIp1SourceIp,
                destinationPort: '5000',
                protocol: 'Tcp',
              },
              override: {
                destinationIp: privateIp1SourceIp,
                destinationPort: '22',
              },
            },
          ],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });

    it('internal load balancer with pool rool', () => {
      const {services} = createGraphServicesMock();
      services.index.add(poolRule1);
      services.index.add(backendPool1);
      services.index.add(privateIp1);
      services.index.add(privateIp2);

      const subnetKey = 'test-subnet';
      const route = convertLoadBalancer(services, loadBalancer1, subnetKey);
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify return value
      const expectedRoute: SimpleRoutingRuleSpec = {
        destination: loadBalancerWithNatRuleKey,
        constraints: {
          destinationIp: privateIpToLoadBalancer,
        },
      };
      assert.deepEqual(route, expectedRoute);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: loadBalancerWithNatRuleKey,
          routes: [
            {
              destination: subnetKey,
              constraints: {
                destinationIp: privateIpToLoadBalancer,
                destinationPort: '5000',
                protocol: 'Tcp',
              },
              override: {
                destinationIp: `${privateIp1SourceIp},${privateIp2SourceIp}`,
                destinationPort: '22',
              },
            },
          ],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });
  });
}
