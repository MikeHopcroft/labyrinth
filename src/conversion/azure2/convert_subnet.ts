import {SimpleRoutingRuleSpec} from '../../graph';

import {buildInboundOutboundNodes} from './build_inbound_outbound_nodes';
import {GraphServices} from './graph_services';
import {AzureSubnet, AzureNetworkInterface} from './types';

export function convertSubnet(
  services: GraphServices,
  spec: AzureSubnet,
  parent: string,
  vnetSymbol: string
): SimpleRoutingRuleSpec {
  const keyPrefix = spec.id;

  // Materialize nics and add routes.
  const routeBuilder = (parent: string): SimpleRoutingRuleSpec[] => {
    const routes: SimpleRoutingRuleSpec[] = [];
    for (const nic of services.index
      .for(spec)
      .withType(AzureNetworkInterface)) {
      routes.push(services.convert.nic(services, nic, parent, vnetSymbol));
    }
    return routes;
  };

  const route = buildInboundOutboundNodes(
    services,
    keyPrefix,
    routeBuilder,
    spec.properties.networkSecurityGroup,
    parent,
    vnetSymbol,
    spec.properties.addressPrefix
  );

  // Subnet differs from NIC in that its inbound routing rule is for all
  // ips in the addressPrefix, instead of the union of the ip configurations
  // actually present.
  return {
    destination: route.destination,
    constraints: {destinationIp: spec.properties.addressPrefix},
  };
}
