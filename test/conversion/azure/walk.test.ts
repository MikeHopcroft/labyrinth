import {assert} from 'chai';
import 'mocha';

import {
  walkAzureObjectBases,
  walkAzureTypedObjects,
} from '../../../src/conversion/azure';

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
      // Not an AzureTypedObject
      id: 'q',
      name: 'nameQ',
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
        // Neither AzureTypedObject, nor AzureObjectBase.
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
    // Not an AzureTypedObject
    id: 'r',
    name: 'nameR',
    resourceGroup: 'rg',
  },
];

describe('Azure2', () => {
  it('walkwalkAzureTypedObjects', () => {
    const expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    const output = [...walkAzureTypedObjects(input)].map(x => x.id);

    assert.deepEqual(output, expected);
  });

  it('walkwalkAzureObjectBases', () => {
    const expected = ['a', 'b', 'q', 'c', 'd', 'e', 'f', 'r'];
    const output = [...walkAzureObjectBases(input)].map(x => x.id);

    assert.deepEqual(output, expected);
  });
});
