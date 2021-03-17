import {NodeSpec, RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';
import {NSGRuleSpecs} from './converters';

import {GraphServices} from './graph_services';
import {AzureNetworkSecurityGroup, AzureReference} from './types';

export function buildNSGRouters(
  services: GraphServices,
  keyPrefix: string,
  internalRoutes: SimpleRoutingRuleSpec[],
  nsgRef: AzureReference<AzureNetworkSecurityGroup> | undefined,
  parent: string,
  vnetSymbol: string
): SimpleRoutingRuleSpec {
  const inboundKey = keyPrefix + '/inbound';
  const outboundKey = keyPrefix + '/outbound';
  const routerKey = keyPrefix + '/outbound';

  const destinationIp = gatherDestinationIps(internalRoutes);

  //
  // Router node
  //
  const routes: RoutingRuleSpec[] = [
    ...internalRoutes,
    {
      destination: outboundKey,
    },
  ];

  const routerNode: NodeSpec = {
    key: routerKey,
    routes,
  };
  services.addNode(routerNode);

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

  //
  // Inbound node
  //
  const inboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules.inboundRules,
    routes: [{destination: routerKey}],
  };
  services.addNode(inboundNode);

  //
  // Outbound node
  //
  const outboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules.outboundRules,
    routes: [{destination: parent}],
  };
  services.addNode(outboundNode);

  return {
    destination: inboundKey,
    constraints: {destinationIp},
  };
}

// TODO: REVIEW: this function assumes that the constraints
// are always simple destinationIp constraints. Is there any
// way to make this assumption more explicit or typesafe?
// What would happen if the routes had other types of constraints?
function gatherDestinationIps(routes: SimpleRoutingRuleSpec[]) {
  const ips: string[] = [];
  for (const route of routes) {
    ips.push(route.constraints.destinationIp);
  }
  return ips.join(',');
}
