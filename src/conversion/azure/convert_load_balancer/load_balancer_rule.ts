import {RoutingRuleSpec} from '../../../graph';
import {AzureObjectIndex} from '../azure_object_index';
import {
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerInboundRule,
  AzureObjectBase,
  AzurePrivateIP,
  AzurePublicIP,
} from '../azure_types';
import {GraphServices} from '../graph_services';

export function createLoadBalancingRuleRoute(
  services: GraphServices,
  spec: AzureLoadBalancerInboundRule,
  frontEndIp: AzurePublicIP,
  gatewayKey: string
): RoutingRuleSpec {
  const rule = spec.properties;
  const index = services.index;

  const backendPool = index.dereference<AzureLoadBalancerBackendPool>(
    spec.properties.backendAddressPool
  );

  const backendIPs = backendPool.properties.backendIPConfigurations.map(ip =>
    getIp(index, ip)
  );

  // TODO: Handle pool. . .
  const ruleSpec: RoutingRuleSpec = {
    destination: gatewayKey,
    constraints: {
      destinationPort: `${rule.frontendPort}`,
      protocol: rule.protocol,
      destinationIp: frontEndIp.properties.ipAddress,
    },
    override: {
      destinationIp: backendIPs
        .map(x => x.properties.privateIPAddress)
        .join(','),
    },
  };

  if (rule.backendPort !== rule.frontendPort) {
    ruleSpec.override!.destinationPort = `${rule.backendPort}`;
  }

  return ruleSpec;
}

function getIp(
  index: AzureObjectIndex,
  specRef: AzureObjectBase
): AzurePrivateIP {
  return index.dereference<AzurePrivateIP>(specRef);
}
