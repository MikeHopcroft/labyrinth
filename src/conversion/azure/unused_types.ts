import {AzureResourceGraph} from './azure_types';
import {GraphServices} from './graph_services';
import {walkAzureTypedObjects} from './walk';

export function unusedTypes(
  services: GraphServices,
  spec: AzureResourceGraph
): Set<string> {
  const unused = new Set<string>();
  for (const item of walkAzureTypedObjects(spec)) {
    if (!services.nodes.isTypeInUse(item)) {
      unused.add(item.type);
    }
  }
  return unused;
}
