import {RoutingRuleSpec} from '../../graph';

import {AzureVirtualMachine} from './azure_types';
import {GraphServices} from './graph_services';

export function convertVm(
  services: GraphServices,
  spec: AzureVirtualMachine,
  parent: string
): RoutingRuleSpec {
  const key = services.nodes.createKey(spec);

  services.nodes.add({
    key,
    name: spec.id,
    endpoint: true,
    routes: [{destination: parent}],
  });

  return {destination: key};
}
