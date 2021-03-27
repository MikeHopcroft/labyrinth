import {assert} from 'chai';
import 'mocha';

import {NodeSpec, RoutingRuleSpec} from '../../../src';

import {convertPublicIp, PublicIpRoutes} from '../../../src/conversion/azure';

import {
  createGraphServicesMock,
  // frontEndIpWithNatRule,
  frontEndIpWithPoolRule,
  isolatedPublicIp,
  isolatedPublicIpInboundKey,
  isolatedPublicIpSourceIp,
  privateIpWithPublic,
  privateIp1SourceIp,
  publicIpToFrontEndLoadBalancer,
  publicIpToFrontEndLoadBalancerIp,
  publicIpWithPrivate,
  publicIpWithPrivateInboundKey,
  publicIpWithPrivateOutboundKey,
  publicIpWithPrivateSourceIp,
  publicIpToFrontEndLoadBalancerInboundKey,
  publicIpWithoutIp,
  publicWithPrivateMissingAddress,
  loadBalancer1,
  loadBalancer1Key,
} from './sample_resource_graph';

export default function test() {
  describe('convertPublicIp()', () => {
    it('support for unbound ip', () => {
      const {services} = createGraphServicesMock();
      services.index.add(privateIpWithPublic);

      const backboneKey = 'backbone';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        publicIpWithoutIp,
        backboneKey,
        internetKey
      );
      assert.deepEqual(result, {inbound: [], outbound: []});
    });

    it('publicIp with privateIp', () => {
      const {services} = createGraphServicesMock();
      services.index.add(privateIpWithPublic);

      const backboneKey = 'backbone';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        publicIpWithPrivate,
        backboneKey,
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
              destination: backboneKey,
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

    it('publicIp bound to privateIp with no address', () => {
      const {services} = createGraphServicesMock();
      services.index.add(publicWithPrivateMissingAddress);

      const backboneKey = 'backbone';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        publicWithPrivateMissingAddress,
        backboneKey,
        internetKey
      );
      assert.deepEqual(result, {inbound: [], outbound: []});
    });

    it('isolated publicIp', () => {
      const {services} = createGraphServicesMock();
      services.index.add(privateIpWithPublic);

      const backboneKey = 'backbone';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        isolatedPublicIp,
        backboneKey,
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

    it('load balanced public ip', () => {
      const {services} = createGraphServicesMock();

      services.index.add(loadBalancer1);
      services.index.add(frontEndIpWithPoolRule);

      const backboneKey = 'backbone';
      const internetKey = 'internet';

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertPublicIp(
        services,
        publicIpToFrontEndLoadBalancer,
        backboneKey,
        internetKey
      );
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

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

      // Verify graph
      const expectedNodes: NodeSpec[] = [
        {
          key: publicIpToFrontEndLoadBalancerInboundKey,
          routes: [
            {
              destination: loadBalancer1Key,
            },
          ],
        },
      ];
      assert.deepEqual(nodes, expectedNodes);
    });
  });
}
