import {assert} from 'chai';
import 'mocha';

import {NodeSpec, RoutingRuleSpec} from '../../../src';

import {convertPublicIp, PublicIpRoutes} from '../../../src/conversion/azure';

import {
  backendPool1,
  createGraphServicesMock,
  frontEndIpWithNatRule,
  isolatedPublicIp,
  isolatedPublicIpInboundKey,
  isolatedPublicIpSourceIp,
  natRule1,
  poolRule1,
  privateIp1,
  privateIp2,
  privateIpWithPublic,
  privateIp1SourceIp,
  publicIpToFrontEndLoadBalancer,
  publicIpToFrontEndLoadBalancerIp,
  publicIpWithPrivate,
  publicIpWithPrivateInboundKey,
  publicIpWithPrivateOutboundKey,
  publicIpWithPrivateSourceIp,
  publicIpToFrontEndLoadBalancerInboundKey,
} from './sample_resource_graph';

export default function test() {
  describe('convertPublicIp()', () => {
    it('publicIp with privateIp', () => {
      const {services} = createGraphServicesMock();
      services.index.add(privateIpWithPublic);

      const gatewayKey = 'gateway';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        publicIpWithPrivate,
        gatewayKey,
        internetKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify return value
      const expectedResult: PublicIpRoutes = {
        inbound: [
          {
            destination: publicIpWithPrivateInboundKey,
            constraints: {
              destinationIp: publicIpWithPrivateSourceIp,
            },
          },
        ],
        outbound: [
          {
            destination: publicIpWithPrivateOutboundKey,
            constraints: {
              sourceIp: privateIp1SourceIp,
            },
          },
        ],
      };
      assert.deepEqual(result, expectedResult);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: publicIpWithPrivateInboundKey,
          routes: [
            {
              destination: gatewayKey,
              override: {
                destinationIp: privateIp1SourceIp,
              },
            },
          ],
        },
        {
          key: publicIpWithPrivateOutboundKey,
          routes: [
            {
              destination: internetKey,
              override: {
                sourceIp: publicIpWithPrivateSourceIp,
              },
            },
          ],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });

    it('isolated publicIp', () => {
      const {services} = createGraphServicesMock();
      services.index.add(privateIpWithPublic);

      const gatewayKey = 'gateway';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        isolatedPublicIp,
        gatewayKey,
        internetKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify return value
      const expectedResult: PublicIpRoutes = {
        inbound: [
          {
            destination: isolatedPublicIpInboundKey,
            constraints: {
              destinationIp: isolatedPublicIpSourceIp,
            },
          },
        ],
        outbound: [],
      };
      assert.deepEqual(result, expectedResult);

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: isolatedPublicIpInboundKey,
          routes: [],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });

    it('front end load balancer - pool', () => {
      const {services, mocks} = createGraphServicesMock();
      services.index.add(backendPool1);
      services.index.add(privateIp1);
      services.index.add(privateIp2);
      // services.index.add(poolRule1);
      // services.index.add(frontEndIpWithPoolRule);

      const route: RoutingRuleSpec = {
        destination: 'abc',
      };

      mocks.loadBalancerFrontend.action(() => {
        return route;
      });

      services.index.add(natRule1);
      services.index.add(frontEndIpWithNatRule);

      const gatewayKey = 'gateway';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        publicIpToFrontEndLoadBalancer,
        gatewayKey,
        internetKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();
      console.log(JSON.stringify(nodes, null, 2));

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify return value
      const expectedResult: PublicIpRoutes = {
        inbound: [
          {
            destination: publicIpToFrontEndLoadBalancerInboundKey,
            constraints: {
              destinationIp: publicIpToFrontEndLoadBalancerIp,
            },
          },
        ],
        outbound: [],
      };
      assert.deepEqual(result, expectedResult);

      // Verify that loadBalancerFrontend() was invoked correctly.
      const log = mocks.loadBalancerFrontend.log();
      assert.equal(log.length, 1);
      assert.equal(log[0].params[1], frontEndIpWithNatRule);
      assert.equal(log[0].params[2], gatewayKey);

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: publicIpToFrontEndLoadBalancerInboundKey,
          routes: [route],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });
  });
}
