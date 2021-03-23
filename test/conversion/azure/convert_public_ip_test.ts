import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {convertPublicIp, PublicIpRoutes} from '../../../src/conversion/azure';

import {
  createGraphServicesMock,
  isolatedPublicIp,
  isolatedPublicIpInboundKey,
  isolatedPublicIpSourceIp,
  privateIpWithPublic,
  privateIp1SourceIp,
  publicIpWithPrivate,
  publicIpWithPrivateInboundKey,
  publicIpWithPrivateOutboundKey,
  publicIpWithPrivateSourceIp,
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
  });
}
