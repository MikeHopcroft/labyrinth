import DRange from 'drange';

import {formatIpLiteral, parseIp} from '../../dimensions';
import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';

import {AzureLoadBalancer, AzureVirtualNetwork} from './azure_types';
import {isInternalLoadBalancer} from './convert_load_balancer';
import {GraphServices} from './graph_services';

export function convertVNet(
  services: GraphServices,
  spec: AzureVirtualNetwork,
  parent: string
): SimpleRoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  const vNetKeyPrefix = services.nodes.createKey(spec);
  const vNetRouterKey = services.nodes.createKeyVariant(
    vNetKeyPrefix,
    'router'
  );
  const vNetServiceTag = vNetKeyPrefix;
  const vNetInboundKey = services.nodes.createKeyVariant(
    vNetKeyPrefix,
    'inbound'
  );

  // Compute this VNet's address range by unioning up all of its address prefixes.
  const addressRange = new DRange();
  for (const address of spec.properties.addressSpace.addressPrefixes) {
    const ip = parseIp(address);
    addressRange.add(ip);
  }
  const destinationIp = formatIpLiteral(addressRange);
  services.symbols.defineServiceTag(vNetServiceTag, destinationIp);

  // Create outbound rule (traffic leaving vnet).
  // TODO: this should not route directly to the internet.
  // It should route to its parent (which will likely be the AzureBackbone or Gateway)
  const routerRoutes: RoutingRuleSpec[] = [
    {
      destination: parent,
      constraints: {destinationIp: `except ${destinationIp}`},
    },
  ];

  // Materialize Internal Load Balancers and add Routes
  for (const lbSpec of services.index.for(spec).withType(AzureLoadBalancer)) {
    const route = services.convert.loadBalancer(
      services,
      lbSpec,
      vNetInboundKey
    );

    if (route) {
      routerRoutes.push(route);
    }
  }

  routerRoutes.push({
    destination: vNetInboundKey,
  });

  const inboundRoutes: RoutingRuleSpec[] = [];
  // Materialize subnets and create routes to each.
  for (const subnetSpec of spec.properties.subnets) {
    const route = services.convert.subnet(
      services,
      subnetSpec,
      vNetRouterKey,
      vNetServiceTag
    );
    inboundRoutes.push(route);
  }

  services.nodes.add({
    key: vNetRouterKey,
    name: spec.id,
    range: {sourceIp: destinationIp},
    routes: routerRoutes,
  });

  services.nodes.add({
    key: vNetInboundKey,
    name: spec.id,
    routes: inboundRoutes,
  });

  return {
    destination: vNetRouterKey,
    constraints: {destinationIp},
  };
}
