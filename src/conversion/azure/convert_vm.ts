import {RoutingRuleSpec} from '../../graph';

import {AzureVirtualMachine} from './azure_types';
import {GraphServices} from './graph_services';

export function convertVM(
  services: GraphServices,
  spec: AzureVirtualMachine,
  parentRoute: RoutingRuleSpec
): RoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  const key = services.nodes.createKey(spec);
  let node = services.nodes.get(key);
  if (!node) {
    node = {
      key,
      name: spec.id,
      endpoint: true,
      routes: [],
    };
    services.nodes.add(node);
  }

  node.routes.push(parentRoute);

  return {destination: key};
}
