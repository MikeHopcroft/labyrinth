import {assert} from 'chai';
import 'mocha';
import {convertLoadBalancerFrontEndIp} from '../../../src/conversion/azure/convert_load_balancer';
import {convertPublicIp} from '../../../src/conversion/azure/convert_public_ip';

import {
  backendPool1,
  backendPool1SourceIp,
  createGraphServicesMock,
  frontEndIpWithNatRule,
  frontEndIpWithPoolRule,
  natRule1,
  poolRule1,
  privateIp1,
  privateIp1SourceIp,
  privateIp2,
  publicIp1,
  publicIp1SourceIp,
  publicIpForLoadBalancer1,
} from './sample_resource_graph';

export default function test() {
  describe('convertLoadBalancer()', () => {
    it('load balancer should be supported by public ip', () => {
      assert.fail();
      //   const {services, mocks} = createGraphServicesMock();
      //   const gatewayKey = 'gatewayKey';
      //   const internetKey = 'internetKey';

      //   const expectedRoutes = {
      //     inbound: [
      //       {
      //         destination: 'MockedInbound',
      //       },
      //     ],
      //     outbound: [
      //       {
      //         destination: 'MockedInbound',
      //       },
      //     ],
      //   };

      //   services.index.add(frontEndIpWithNatRule);

      //   mocks.loadBalancerFrontend.action(() => {
      //     return expectedRoutes;
      //   });

      //   convertPublicIp(
      //     services,
      //     publicIpForLoadBalancer1,
      //     gatewayKey,
      //     internetKey
      //   );

      //   const nicLog = mocks.loadBalancerFrontend.log();
      //   assert.equal(nicLog.length, 1);
    });

    it('load balancer nat rule', () => {
      assert.fail();
      //   const {services} = createGraphServicesMock();
      //   const gatewayKey = 'test-gateway';

      //   services.index.add(privateIp1);
      //   services.index.add(natRule1);

      //   const routes = convertLoadBalancerFrontEndIp(
      //     services,
      //     frontEndIpWithNatRule,
      //     publicIp1,
      //     gatewayKey
      //   );

      //   const natRule = natRule1.properties;
      //   const expected = {
      //     inbound: [
      //       {
      //         constraints: {
      //           destinationIp: publicIp1SourceIp,
      //           destinationPort: `${natRule.frontendPort}`,
      //           protocol: natRule.protocol,
      //         },
      //         destination: gatewayKey,
      //         override: {
      //           destinationIp: privateIp1SourceIp,
      //           destinationPort: `${natRule.backendPort}`,
      //         },
      //       },
      //     ],
      //     outbound: [],
      //   };
      //   assert.deepEqual(routes, expected);
    });

    it('load balancer pool rule', () => {
      assert.fail();
      //   const {services} = createGraphServicesMock();
      //   const gatewayKey = 'test-gateway';

      //   services.index.add(poolRule1);
      //   services.index.add(backendPool1);
      //   services.index.add(privateIp1);
      //   services.index.add(privateIp2);

      //   const routes = convertLoadBalancerFrontEndIp(
      //     services,
      //     frontEndIpWithPoolRule,
      //     publicIp1,
      //     gatewayKey
      //   );

      //   const natRule = natRule1.properties;
      //   const expected = {
      //     inbound: [
      //       {
      //         constraints: {
      //           destinationIp: publicIp1SourceIp,
      //           destinationPort: `${natRule.frontendPort}`,
      //           protocol: natRule.protocol,
      //         },
      //         destination: gatewayKey,
      //         override: {
      //           destinationIp: backendPool1SourceIp,
      //           destinationPort: `${natRule.backendPort}`,
      //         },
      //       },
      //     ],
      //     outbound: [],
      //   };
      //   assert.deepEqual(routes, expected);
    });
  });
}
