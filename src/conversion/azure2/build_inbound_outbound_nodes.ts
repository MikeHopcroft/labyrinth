import {NodeSpec, SimpleRoutingRuleSpec} from '../../graph';
import {NSGRuleSpecs} from './converters';

import {GraphServices} from './graph_services';
import {AzureNetworkSecurityGroup, AzureReference} from './types';

export function buildInboundOutboundNodes(
  services: GraphServices,
  keyPrefix: string,
  routeBuilder: (parent: string) => SimpleRoutingRuleSpec[],
  nsgRef: AzureReference<AzureNetworkSecurityGroup> | undefined,
  parent: string,
  vnetSymbol: string,
  addressRange: string | undefined = undefined
): SimpleRoutingRuleSpec {
  //
  // NSG rules
  //
  let nsgRules: NSGRuleSpecs = {
    inboundRules: [],
    outboundRules: [],
  };

  if (nsgRef) {
    const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
      nsgRef
    );
    nsgRules = services.convert.nsg(nsgSpec, vnetSymbol);
  }

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = keyPrefix + '/inbound';

  // Only include an outbound node if there are outbound NSG rules.
  const outboundKey =
    nsgRules.outboundRules.length > 0 ? keyPrefix + '/outbound' : parent;

  const inboundRoutes = routeBuilder(outboundKey);

  //
  // Construct inbound node
  //
  const inboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules.inboundRules,
    routes: inboundRoutes,
  };
  services.addNode(inboundNode);

  //
  // If there are outbound NSG rules, construct outbound node
  //
  if (nsgRules.outboundRules.length > 0) {
    const outboundNode: NodeSpec = {
      key: outboundKey,
      filters: nsgRules.outboundRules,
      routes: [{destination: parent}],
    };
    services.addNode(outboundNode);
  }

  //
  // Return route for use by parent node.
  //
  const destinationIp = addressRange ?? gatherDestinationIps(inboundRoutes);
  return {
    destination: inboundKey,
    constraints: {destinationIp},
  };
}

function gatherDestinationIps(routes: SimpleRoutingRuleSpec[]) {
  const ips: string[] = [];
  for (const route of routes) {
    ips.push(route.constraints.destinationIp);
  }
  return ips.join(',');
}
