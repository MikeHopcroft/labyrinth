import {AzureResourceGraph, AzureTypedObject} from './azure_types';
import {walkAzureObjectBases} from './walk';

// DESIGN NOTE: Azure resource graphs use an inconsistent mixture of upper and
// lower casing in the AzureTypedObject's `type` field. This codebase assumes
// lower case, meaning that the `type` fields in the resource graph must be
// down cased before attempting to generate a Labyrinth graph.
//
// The normalizeCase() function downcases all of the `type` fields in an Azure
// resource graph. The input graph is side effected. The `id` fields are not
// changed.
export function normalizeCase(resourceGraphSpec: AzureResourceGraph) {
  for (const item of walkAzureObjectBases(resourceGraphSpec)) {
    item.id = item.id.toLowerCase();
    const typedItem = item as AzureTypedObject;
    if (typedItem.type) {
      typedItem.type = typedItem.type.toLowerCase();
    }
  }
}
