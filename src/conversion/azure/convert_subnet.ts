import {SimpleRoutingRuleSpec} from '../../graph';

import {AzureSubnet, AzureNetworkInterface} from './azure_types';
import {buildInboundOutboundNodes} from './build_inbound_outbound_nodes';
import {GraphServices} from './graph_services';

export function convertSubnet(
  services: GraphServices,
  spec: AzureSubnet,
  parent: string,
  vnetSymbol: string
): SimpleRoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

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
    spec,
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
