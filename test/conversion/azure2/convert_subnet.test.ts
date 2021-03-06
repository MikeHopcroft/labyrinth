import {assert} from 'chai';
import 'mocha';

import {ActionType, NodeSpec, RuleSpec} from '../../../src';

import {
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  convertSubnet,
  GraphServices,
  NSGRuleSpecs,
} from '../../../src/conversion/azure2';

// DESIGN NOTE: considered namespacing these items, but their usage became
// too verbose. Expect that numbers in names (e.g. subnet1) prevent collisions
// with similar terms.
import {
  createGraphServicesMock,
  localIp1,
  localIp1Id,
  localIp1Name,
  localIp1SourceIp,
  nsg1,
  publicIp1,
  publicIp1Id,
  publicIp1Name,
  publicIp1SourceIp,
  subnet1,
  subnet1SourceIps,
  vnet1Id,
} from './sample_resource_graph';

export default function test() {
  describe('convertSubnet()', () => {
    it('Subnet with two ipConfigurations', () => {
      const {services, mocks} = createGraphServicesMock();

      // convertSubnet() expects to find its nsg spec in the index.
      services.index.add(nsg1);
      services.index.add(localIp1);
      services.index.add(publicIp1);

      mocks.ip.action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (services: GraphServices, ipSpec: AzureIPConfiguration) => {
          if (ipSpec.name === localIp1Name) {
            return {
              key: localIp1Id,
              destinationIp: localIp1SourceIp,
            };
          } else if (ipSpec.name === publicIp1Name) {
            return {
              key: publicIp1Id,
              destinationIp: publicIp1SourceIp,
            };
          } else {
            throw new TypeError('Unknown ip configuration');
          }
        }
      );

      const inboundRules: RuleSpec[] = [
        {
          action: ActionType.ALLOW,
          priority: 1,
          id: 1,
          source: 'abc',
        },
      ];

      const outboundRules: RuleSpec[] = [
        {
          action: ActionType.DENY,
          priority: 2,
          id: 2,
          source: 'def',
        },
      ];

      mocks.nsg.action(
        (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          services: GraphServices,
          nsgSpec: AzureNetworkSecurityGroup,
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

      // DESIGN NOTE: cannot call services.convert.vnet()  because our intent
      // is to test the real convertVNet(), instead of its mock.
      const result = convertSubnet(services, subnet1, vnet1Id);
      const {nodes: observedNodes} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.key, `${subnet1.id}/inbound`);
      assert.equal(result.destinationIp, subnet1SourceIps);

      // Verify that ipConverter() was invoked correctly.
      const log = mocks.ip.log();
      assert.equal(log.length, 2);
      assert.equal(log[0].params[1], localIp1);
      assert.equal(log[1].params[1], publicIp1);

      // Verify the service tag definition.
      assert.deepEqual(services.symbols.getSymbolSpec(subnet1.id), {
        dimension: 'ip',
        symbol: subnet1.id,
        range: subnet1SourceIps,
      });

      // Verify that correct VNet nodes were created in services.
      const expectedNodes: NodeSpec[] = [
        // Router
        {
          key: `${subnet1.id}/router`,
          range: {
            sourceIp: subnet1SourceIps,
          },
          routes: [
            {
              destination: `${subnet1.id}/outbound`,
              constraints: {
                destinationIp: `except ${subnet1SourceIps}`,
              },
            },
            {
              destination: localIp1Id,
              constraints: {
                destinationIp: localIp1SourceIp,
              },
            },
            {
              destination: publicIp1Id,
              constraints: {
                destinationIp: publicIp1SourceIp,
              },
            },
          ],
        },

        // Inbound
        {
          key: `${subnet1.id}/inbound`,
          filters: inboundRules,
          routes: [
            {
              destination: `${subnet1.id}/router`,
            },
          ],
        },

        // Outbound
        {
          key: `${subnet1.id}/outbound`,
          filters: outboundRules,
          routes: [
            {
              destination: vnet1Id,
            },
          ],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });
  });
}
