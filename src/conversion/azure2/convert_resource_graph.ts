import {GraphServices} from './graph_services';
import {asAzureVirtualNetwork, AzureResourceGraph} from './types';

export function convertResourceGraph(
  builder: GraphServices,
  resourceGraphSpec: AzureResourceGraph
) {
  const vNetNodeKeys: string[] = [];
  for (const item of resourceGraphSpec) {
    const vnet = asAzureVirtualNetwork(item);
    if (vnet) {
      // process vnet
      const key = builder.convert.vnet(builder, vnet);
      vNetNodeKeys.push(key);
    }
  }
  // Define symbol for internet.
}
