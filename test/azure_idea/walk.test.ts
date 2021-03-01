import {assert} from 'chai';
import 'mocha';

import {walk} from '../../src/conversion/azure_idea';

describe('Azure Idea', () => {
  it('walk', () => {
    const input = [
      {
        // Should be included
        id: 'a',
        name: 'nameA',
        resourceGroup: 'rg',
        type: 'typeA',
        child1: {
          // Should be included
          id: 'b',
          name: 'nameB',
          resourceGroup: 'rg',
          type: 'typeB',
        },
        other: {
          // Not an AzureObjectBase
          id: 'x',
          name: 'nameX',
          resourceGroup: 'rg',
        },
      },
      {
        // Should be included
        id: 'c',
        name: 'nameC',
        resourceGroup: 'rg',
        type: 'typeC',
        children: [
          {
            // Should be included
            id: 'd',
            name: 'nameD',
            resourceGroup: 'rg',
            type: 'typeD',
          },
          {
            // Should not be included.
            id: 'y',
          },
          {
            // Should be included
            id: 'e',
            name: 'nameE',
            resourceGroup: 'rg',
            type: 'typeE',
          },
        ],
      },
      {
        // Should be included
        id: 'f',
        name: 'nameF',
        resourceGroup: 'rg',
        type: 'typeF',
      },
      {
        // Not an AzureObjectBase
        id: 'y',
        name: 'nameY',
        resourceGroup: 'rg',
      },
    ];

    const expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    const output = [...walk(input)].map(x => x.id);

    assert.deepEqual(output, expected);
  });
});
