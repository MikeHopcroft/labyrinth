import DRange from 'drange';

import {formatIpLiteral, parseIp} from '../../dimensions';
import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';

import {AzureVirtualNetwork} from './azure_types';
import {GraphServices} from './graph_services';

export function convertVNet(
  services: GraphServices,
  spec: AzureVirtualNetwork,
  parent: string
): SimpleRoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  const vNetNodeKey = services.nodes.createKey(spec);
  const vNetServiceTag = vNetNodeKey;

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
  const routes: RoutingRuleSpec[] = [
    {
      destination: parent,
      constraints: {destinationIp: `except ${destinationIp}`},
    },
  ];

  // Materialize subnets and create routes to each.
  for (const subnetSpec of spec.properties.subnets) {
    const route = services.convert.subnet(
      services,
      subnetSpec,
      vNetNodeKey,
      vNetServiceTag
    );
    routes.push(route);
  }

  services.nodes.add({
    key: vNetNodeKey,
    name: spec.id,
    range: {sourceIp: destinationIp},
    routes,
  });

  return {
    destination: vNetNodeKey,
    constraints: {destinationIp},
  };
}
