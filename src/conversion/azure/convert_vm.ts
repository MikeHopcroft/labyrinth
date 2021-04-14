import {RoutingRuleSpec} from '../../graph';

import {AzureVirtualMachine} from './azure_types';
import {GraphServices} from './graph_services';

export function convertVM(
  services: GraphServices,
  spec: AzureVirtualMachine,
  outboundNicRoute: RoutingRuleSpec
): RoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  const inboundKey = services.nodes.createInboundKey(spec);
  const outboundKey = services.nodes.createOutboundKey(spec);

  createOrRetrieveNode(services, spec, inboundKey);
  const outboundNode = createOrRetrieveNode(services, spec, outboundKey);
  outboundNode.routes.push(outboundNicRoute);

  return {destination: inboundKey};
}

function createOrRetrieveNode(
  services: GraphServices,
  spec: AzureVirtualMachine,
  key: string
) {
  let node = services.nodes.get(key);
  if (!node) {
    node = {
      key,
      friendlyName: spec.name,
      name: spec.id,
      endpoint: true,
      routes: [],
    };
    services.nodes.add(node);
  }

  return node;
}
