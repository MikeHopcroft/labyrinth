import {NodeSpec, RoutingRuleSpec} from '../../graph';

import {AzureGraphNode} from './azure_graph_node';

import {NodeKeyAndSourceIp} from '../types';

import {NetworkInterfaceNode} from './convert_network_interface';
import {NetworkSecurityGroupNode} from './convert_network_security_group';
import {VirtualNetworkNode} from './convert_vnet';
import {GraphServices} from './graph_services';

import {AzureObjectType, AzureReference, AzureSubnet} from './types';

interface SubnetKeys {
  prefix: string;
  inbound: string;
  outbound: string;
}

export function subnetKeys(input: AzureReference<AzureSubnet>): SubnetKeys {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const prefix = input.id;

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inbound = prefix + '/inbound';
  const outbound = prefix + '/outbound';

  return {prefix, inbound, outbound};
}

export class SubnetNode extends AzureGraphNode<AzureSubnet> {
  readonly keys: SubnetKeys;

  constructor(subnet: AzureSubnet) {
    super(AzureObjectType.SUBNET, subnet);
    this.keys = subnetKeys(subnet);
  }

  *edges(): IterableIterator<string> {
    if (this.value.properties.ipConfigurations) {
      for (const item of this.value.properties.ipConfigurations) {
        yield item.id;
      }
    }

    if (this.value.properties.networkSecurityGroup) {
      yield this.value.properties.networkSecurityGroup.id;
    }
  }

  nics(): IterableIterator<NetworkInterfaceNode> {
    return this.typedEdges<NetworkInterfaceNode>(AzureObjectType.NIC);
  }

  vnet(): VirtualNetworkNode {
    return this.first<VirtualNetworkNode>(AzureObjectType.VIRTUAL_NETWORK);
  }

  nsg(): NetworkSecurityGroupNode | undefined {
    return this.firstOrDefault<NetworkSecurityGroupNode>(AzureObjectType.NSG);
  }

  // *ipAddreses(): IterableIterator<IpNode> {
  //   for (const localIp of this.typedEdges<IpNode>(AzureObjectType.LOCAL_IP)) {
  //     yield localIp;
  //   }

  //   for (const publicIp of this.typedEdges<IpNode>(AzureObjectType.PUBLIC_IP)) {
  //     yield publicIp;
  //   }
  // }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    const subnetSpec = this.value;
    const keys = subnetKeys(subnetSpec);

    const routes: RoutingRuleSpec[] = [
      // Traffic leaving subnet
      {
        constraints: {
          destinationIp: `except ${subnetSpec.properties.addressPrefix}`,
        },
        destination: keys.outbound,
      },
    ];

    // For each ipConfiguration
    //   Materialize ipConfiguration
    //   Add routing rule
    for (const nic of this.nics()) {
      const {key, destinationIp} = nic.convert(services);
      routes.push({
        destination: key,
        constraints: {destinationIp},
      });
    }

    const nsg = this.nsg();
    const nsgRules = nsg?.convertRules(this.vnet().serviceTag);

    const inboundNode: NodeSpec = {
      key: keys.inbound,
      filters: nsgRules?.inboundRules,
      // TODO: do we want range here?
      // TODO: is this correct? The router moves packets in both directions.
      routes,
    };
    services.addNode(inboundNode);

    const outboundNode: NodeSpec = {
      key: keys.outbound,
      filters: nsgRules?.outboundRules,
      routes: [
        {
          destination: this.vnet().nodeKey,
        },
      ],
    };
    services.addNode(outboundNode);

    return {
      key: inboundNode.key,
      destinationIp: subnetSpec.properties.addressPrefix,
    };
  }
}
