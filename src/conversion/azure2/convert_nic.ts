import {NodeSpec, RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';
import {NSGRuleSpecs} from './converters';

import {GraphServices} from './graph_services';
import {AzureNetworkInterface, AzureNetworkSecurityGroup} from './types';

// Memoizing
//  How does memoizing work if caller needs node key?
//  What if second call passes different parameters?
// Verify that all IpConfigs have same subnet
// Add NIC to group for subnet
// Materialize inbound, outbound, and router nodes

export function convertNIC(
  services: GraphServices,
  spec: AzureNetworkInterface,
  parent: string,
  vnetKey: string
): SimpleRoutingRuleSpec {
  const keyPrefix = spec.id;

  const inboundKey = keyPrefix + '/inbound';
  const outboundKey = keyPrefix + '/outbound';
  const routerKey = keyPrefix + '/router';

  //
  // Router node
  //
  const internalRoutes: SimpleRoutingRuleSpec[] = [];

  // Traffic going to IP configurations on this NIC.
  for (const ip of spec.properties.ipConfigurations) {
    internalRoutes.push(services.convert.ip(services, ip));
  }
  const destinationIp = gatherDestinationIps(internalRoutes);

  // Traffic leaving NIC
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
  const nsgRef = spec.properties.networkSecurityGroup;
  if (nsgRef) {
    const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
      nsgRef
    );
    nsgRules = services.convert.nsg(nsgSpec, vnetKey);
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
    key: outboundKey,
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
