import {GraphServices} from './graph_services';
import {AzureSubnet} from './types';

export function subnet(
  builder: GraphServices,
  spec: AzureSubnet,
  vNetKey: string
): string {
  // For each ipConfiguration
  //   Materialize ipConfiguration
  //   Add routing rule
  return 'subnet';
}
