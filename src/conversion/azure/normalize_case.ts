import {AzureResourceGraph, AzureTypedObject} from './azure_types';
import {walkGraph} from './walk';

// DESIGN NOTE: Azure resource graphs use an inconsistent mixture of upper and
// lower casing in the AzureTypedObject's `type` field. This codebase assumes
// lower case, meaning that the `type` fields in the resource graph must be
// down cased before attempting to generate a Labyrinth graph.
//
// The normalizeCase() function downcases all of the `type` fields in an Azure
// resource graph. The input graph is side effected. The `id` fields are not
// changed.
export function normalizeCase(resourceGraphSpec: AzureResourceGraph) {
  for (const item of walkGraph<AzureTypedObject>(resourceGraphSpec)) {
    if (item.id) {
      item.id = item.id.toLowerCase();
    }

    if (item.name) {
      item.name = item.name.toLowerCase();
    }

    if (item.type) {
      item.type = item.type.toLowerCase();
    }
  }
}
