import {SimpleRoutingRuleSpec} from '../../graph';

import {AzureNetworkInterface} from './azure_types';
import {buildInboundOutboundNodes} from './build_inbound_outbound_nodes';
import {GraphServices} from './graph_services';

// TODO: Verify that all IpConfigs have same subnet

export function convertNIC(
  services: GraphServices,
  spec: AzureNetworkInterface,
  parent: string,
  vnetKey: string
): SimpleRoutingRuleSpec {
  const keyPrefix = spec.id;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const routeBuilder = (parent: string): SimpleRoutingRuleSpec[] =>
    spec.properties.ipConfigurations.map(ip =>
      services.convert.ip(services, ip)
    );

  return buildInboundOutboundNodes(
    services,
    keyPrefix,
    routeBuilder,
    spec.properties.networkSecurityGroup,
    parent,
    vnetKey
  );
}
