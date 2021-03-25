import {AzureResourceGraph} from './azure_types';
import {GraphServices} from './graph_services';
import {walkAzureTypedObjects} from './walk';

export function unusedTypes(
  services: GraphServices,
  spec: AzureResourceGraph
): Map<string, Set<string>> {
  const unused = new Map<string, Set<string>>();
  for (const item of walkAzureTypedObjects(spec)) {
    if (
      services.index.isTopLevelResource(item) &&
      !services.nodes.isTypeInUse(item)
    ) {
      let items = unused.get(item.type);

      if (!items) {
        items = new Set<string>();
        unused.set(item.type, items);
      }

      items.add(item.id);
    }
  }
  return unused;
}
