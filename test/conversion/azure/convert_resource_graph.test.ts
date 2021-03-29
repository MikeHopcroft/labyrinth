import {assert} from 'chai';
import 'mocha';

import {AnyAzureObject} from '../../../src/conversion/azure';
import {convert} from '../../../src/conversion/azure/convert';

import {nsg1, vnet1} from './sample_resource_graph';

// import {NodeSpec} from '../../../src';

// import {convertResourceGraph} from '../../../src/conversion/azure';

// import {createGraphServicesMock} from './sample_resource_graph';

export default function test() {
  describe('convertResourceGraph()', () => {
    it.skip('simple', () => {
      // TODO: implement test.
      assert.fail();
    });

    it('validate default creation of internet and backbone', () => {
      const expectedNodes = [
        {
          key: 'AzureBackbone/inbound',
          routes: [],
        },
        {
          key: 'AzureBackbone/outbound',
          routes: [
            {
              destination: 'Internet',
            },
          ],
        },
        {
          endpoint: true,
          key: 'Internet',
          routes: [],
        },
      ];

      const emptyGraph: AnyAzureObject[] = [];
      const result = convert(emptyGraph);
      assert.deepEqual(result.graph.nodes, expectedNodes);
    });

    it.skip('backbone should not have inbound vnet routes', () => {
      // Test currently skipped as convert has an adverse reaction which normalizes
      // the ids which then breaks future tests. There are a few ways to fix this
      // however not addressed until we can chat about it.
      const graphWithVnet: AnyAzureObject[] = [vnet1, nsg1];
      const result = convert(graphWithVnet);
      const inboundNode = result.graph.nodes.find(
        x => x.key === 'AzureBackbone/inbound'
      );
      assert.deepEqual(inboundNode?.routes, []);
    });
  });
}
