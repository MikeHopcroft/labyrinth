import DRange from 'drange';

import {formatIpLiteral, parseIp} from '../../dimensions';
import {RoutingRuleSpec} from '../../graph';

import {AzureVirtualNetwork} from './azure_types';
import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';

export function convertVNet(
  services: GraphServices,
  spec: AzureVirtualNetwork
): NodeKeyAndSourceIp {
  const vNetNodeKey = services.ids.createKey(spec);
  const vNetServiceTag = vNetNodeKey;

  // Compute this VNet's address range by unioning up all of its address prefixes.
  const addressRange = new DRange();
  for (const address of spec.properties.addressSpace.addressPrefixes) {
    const ip = parseIp(address);
    addressRange.add(ip);
  }
  const sourceIp = formatIpLiteral(addressRange);
  services.symbols.defineServiceTag(vNetServiceTag, sourceIp);

  // Create outbound rule (traffic leaving vnet).
  const routes: RoutingRuleSpec[] = [
    {
      destination: services.getInternetKey(),
      constraints: {destinationIp: `except ${sourceIp}`},
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

  services.addNode({
    key: vNetNodeKey,
    name: spec.id,
    range: {sourceIp},
    routes,
  });

  return {key: vNetNodeKey, destinationIp: sourceIp};
}
