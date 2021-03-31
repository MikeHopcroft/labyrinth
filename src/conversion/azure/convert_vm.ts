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

  createOrRetrieveNode(services, inboundKey, spec.id);
  const outboundNode = createOrRetrieveNode(
    services,
    outboundKey,
    `${spec.id}/outbound`
  );
  outboundNode.routes.push(outboundNicRoute);

  return {destination: inboundKey};
}

function createOrRetrieveNode(
  services: GraphServices,
  key: string,
  name: string
) {
  let node = services.nodes.get(key);
  if (!node) {
    node = {
      key,
      name,
      endpoint: true,
      routes: [],
    };
    services.nodes.add(node);
  }

  return node;
}
