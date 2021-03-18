import {SimpleRoutingRuleSpec} from '../../graph';

import {AzureNetworkInterface} from './azure_types';
import {buildInboundOutboundNodes} from './build_inbound_outbound_nodes';
import {GraphServices} from './graph_services';

// TODO: Verify that all IpConfigs have same subnet

export function convertNIC(
  services: GraphServices,
  spec: AzureNetworkInterface,
  parent: string,
  vnetSymbol: string
): SimpleRoutingRuleSpec {
  const routeBuilder = (parent: string): SimpleRoutingRuleSpec[] =>
    spec.properties.ipConfigurations.map(ip =>
      services.convert.ip(services, ip, parent)
    );

  return buildInboundOutboundNodes(
    services,
    spec,
    routeBuilder,
    spec.properties.networkSecurityGroup,
    parent,
    vnetSymbol
  );
}
