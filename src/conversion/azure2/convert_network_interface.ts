import {NodeSpec} from '../../graph';

import {AzureGraphNode} from './azure_graph_node';
import {NodeKeyAndSourceIp} from './converters';
import {IpNode} from './convert_ip';
import {SubnetNode} from './convert_subnet';
import {GraphServices} from './graph_services';
import {AzureNetworkInterface, AzureObjectType} from './types';

export class NetworkInterfaceNode extends AzureGraphNode<
  AzureNetworkInterface
> {
  constructor(item: AzureNetworkInterface) {
    super(AzureObjectType.NIC, item);
  }

  *edges(): IterableIterator<string> {
    for (const ipConfig of this.value.properties.ipConfigurations) {
      yield ipConfig.id;

      if (ipConfig.properties.subnet) {
        yield ipConfig.properties.subnet.id;
      }
    }
  }

  subnet(): SubnetNode {
    return this.first<SubnetNode>(AzureObjectType.SUBNET);
  }

  ip(): string {
    return [...this.typedEdges<IpNode>(AzureObjectType.LOCAL_IP)]
      .map(x => x.ipAddress())
      .join(',');
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    const nicSpec = this.value;
    const subnet = this.subnet();

    // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
    const prefix = nicSpec.id;
    const inbound = prefix + '/inbound';
    const outbound = prefix + '/outbound';
    // TODO: Handle NSG

    const inboundNode: NodeSpec = {
      key: inbound,
      endpoint: true,
      routes: [],
    };

    const outboundNode: NodeSpec = {
      key: outbound,
      routes: [
        {
          destination: subnet.keys.outbound,
        },
      ],
    };

    services.addNode(inboundNode);
    services.addNode(outboundNode);

    return {
      key: inboundNode.key,
      destinationIp: this.ip(),
    };
  }
}
