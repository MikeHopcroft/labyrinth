import {NodeSpec} from '../../graph';
import {NodeKeyAndSourceIp} from './converters';
import {subnetKeys} from './convert_subnet';
import {GraphServices} from './graph_services';
import {AzureNetworkInterface, AzureObjectType, AzureReference} from './types';

export function convertNetworkInterface(
  services: GraphServices,
  nicRef: AzureReference<AzureNetworkInterface>
): NodeKeyAndSourceIp {
  const nicSpec: AzureNetworkInterface = services.index.dereference(nicRef);

  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const prefix = nicSpec.id;
  const inbound = prefix + '/inbound';
  const outbound = prefix + '/outbound';
  const ips = new Set<string>();
  // TODO: Handle NSG

  const inboundNode: NodeSpec = {
    key: inbound,
    endpoint: true,
    routes: [],
  };

  const outboundNode: NodeSpec = {
    key: outbound,
    routes: [],
  };

  for (const ipConfig of nicSpec.properties.ipConfigurations) {
    if (
      ipConfig.properties.subnet &&
      ipConfig.type === AzureObjectType.LOCAL_IP
    ) {
      const subnet = subnetKeys(ipConfig.properties.subnet);
      outboundNode.routes.push({
        destination: subnet.outbound,
      });

      ips.add(ipConfig.properties.privateIPAddress);
    }
  }

  services.addNode(inboundNode);
  services.addNode(outboundNode);

  return {
    key: inboundNode.key,
    destinationIp: [...ips.values()].join(','),
  };
}
