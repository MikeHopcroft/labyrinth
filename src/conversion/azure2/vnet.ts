import {GraphServices} from './graph_services';
import {AzureVirtualNetwork} from './types';

export function vnet(
  builder: GraphServices,
  spec: AzureVirtualNetwork
): string {
  // For each subnet
  //   Materialize subnet
  //   Add routing rule from vnet to subnet
  return 'vnet';
}
