import {RoutingRuleSpec} from '../../graph';

import {AzureVirtualMachine} from './azure_types';
import {GraphServices} from './graph_services';

export function convertVm(
  services: GraphServices,
  spec: AzureVirtualMachine,
  parent: string
): RoutingRuleSpec {
  const key = services.ids.createKey(spec);

  services.addNode({
    key,
    name: spec.id,
    endpoint: true,
    routes: [{destination: parent}],
  });

  return {destination: key};
}
