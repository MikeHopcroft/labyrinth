import {GraphServices} from './graph_services';
import {asAzureVirtualNetwork, AzureResourceGraph} from './types';

export function resourceGraph(
  builder: GraphServices,
  spec: AzureResourceGraph
) {
  const keys: string[] = [];
  for (const item of spec) {
    const vnet = asAzureVirtualNetwork(item);
    if (vnet) {
      // process vnet
      const key = builder.convert.vnet(builder, vnet);
      keys.push(key);
    }
  }
  // Define symbol for internet.
}
