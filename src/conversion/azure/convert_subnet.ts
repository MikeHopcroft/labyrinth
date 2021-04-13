import {NSGRuleSpecs} from '.';
import {NodeSpec, SimpleRoutingRuleSpec} from '../../graph';

import {
  AzureSubnet,
  AzureNetworkInterface,
  AzureTypedObject,
  AzureReference,
  AzureNetworkSecurityGroup,
} from './azure_types';
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

function buildInboundOutboundNodes(
  services: GraphServices,
  spec: AzureTypedObject,
  routeBuilder: (outboundNodeKey: string) => SimpleRoutingRuleSpec[],
  nsgRef: AzureReference<AzureNetworkSecurityGroup> | undefined,
  outboundRouteKey: string,
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
    nsgRules = services.convert.nsg(services, nsgSpec, vnetSymbol);
  }

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = services.nodes.createInboundKey(spec);

  // Only include an outbound node if there are outbound NSG rules.
  const outboundKey =
    nsgRules.outboundRules.length > 0
      ? services.nodes.createOutboundKey(spec)
      : outboundRouteKey;

  const inboundRoutes = routeBuilder(outboundKey);

  //
  // Construct inbound node
  //
  const inboundNode: NodeSpec = {
    key: inboundKey,
    name: spec.id + '/inbound',
    friendlyName: spec.name,
    routes: inboundRoutes,
  };
  if (nsgRules.inboundRules.length) {
    inboundNode.filters = nsgRules.inboundRules;
  }
  services.nodes.add(inboundNode);

  //
  // If there are outbound NSG rules, construct outbound node
  //
  if (nsgRules.outboundRules.length > 0) {
    const outboundNode: NodeSpec = {
      key: outboundKey,
      name: spec.id + '/outbound',
      friendlyName: spec.name,
      routes: [{destination: outboundRouteKey}],
    };
    if (nsgRules.outboundRules.length) {
      outboundNode.filters = nsgRules.outboundRules;
    }
    services.nodes.add(outboundNode);
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
