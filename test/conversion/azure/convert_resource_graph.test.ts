import {assert} from 'chai';
import 'mocha';

import {AnyAzureObject} from '../../../src/conversion/azure';
import {
  AzureBackboneFriendlyName,
  AzureBackboneKeyName,
} from '../../../src/conversion/azure/constants';
import {convert} from '../../../src/conversion/azure/convert';

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
          key: `${AzureBackboneKeyName}/outbound`,
          friendlyName: AzureBackboneFriendlyName,
          routes: [
            {
              destination: 'Internet',
            },
          ],
        },
        {
          key: 'Internet',
          routes: [],
        },
      ];

      const emptyGraph: AnyAzureObject[] = [];
      const result = convert(emptyGraph);
      assert.deepEqual(result.graph.nodes, expectedNodes);
    });
  });
}
