import DRange from 'drange';

import {formatIpLiteral, parseIp} from '../../dimensions';
import {RoutingRuleSpec} from '../../graph';

import {AzureGraphNode} from './azure_graph_node';
import {NodeKeyAndSourceIp} from './converters';
import {SubnetNode} from './convert_subnet';
import {GraphServices} from './graph_services';
import {AzureObjectType, AzureVirtualNetwork} from './types';

export class VirtualNetworkNode extends AzureGraphNode<AzureVirtualNetwork> {
  readonly serviceTag: string;
  readonly nodeKey: string;

  constructor(vnet: AzureVirtualNetwork) {
    super(AzureObjectType.VIRTUAL_NETWORK, vnet);
    this.serviceTag = vnet.id;
    this.nodeKey = vnet.id;
  }

  *edges(): IterableIterator<string> {
    for (const item of this.value.properties.subnets) {
      yield item.id;
    }
  }

  subnets(): IterableIterator<SubnetNode> {
    return this.typedEdges<SubnetNode>(AzureObjectType.SUBNET);
  }

  convertNode(services: GraphServices): NodeKeyAndSourceIp {
    // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
    const vNetSpec = this.value;

    // Compute this VNet's address range by unioning up all of its address prefixes.
    const addressRange = new DRange();
    for (const address of vNetSpec.properties.addressSpace.addressPrefixes) {
      const ip = parseIp(address);
      addressRange.add(ip);
    }
    const sourceIp = formatIpLiteral(addressRange);
    services.symbols.defineServiceTag(this.serviceTag, sourceIp);

    // Create outbound rule (traffic leaving vnet).
    const routes: RoutingRuleSpec[] = [
      {
        destination: services.getInternetKey(),
        constraints: {destinationIp: `except ${sourceIp}`},
      },
    ];

    const vnetDestinations: string[] = [];
    // Materialize subnets and create routes to each.
    for (const subnetNode of this.subnets()) {
      const {key: subnetNodeKey, destinationIp} = subnetNode.convert(services);

      routes.push({
        destination: subnetNodeKey,
        constraints: {destinationIp},
      });
      vnetDestinations.push(destinationIp);
    }

    services.addNode({
      key: this.nodeKey,
      range: {sourceIp},
      routes,
    });

    return {key: this.nodeKey, destinationIp: vnetDestinations.join(',')};
  }
}
