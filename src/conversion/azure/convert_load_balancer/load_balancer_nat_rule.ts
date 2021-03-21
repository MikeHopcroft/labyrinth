import {RoutingRuleSpec} from '../../../graph';

import {
  AzureLoadBalancerInboundNatRule,
  AzurePrivateIP,
  AzurePublicIP,
} from '../azure_types';
import {GraphServices} from '../graph_services';

export function createNatRoute(
  services: GraphServices,
  spec: AzureLoadBalancerInboundNatRule,
  frontEndIp: AzurePublicIP,
  gatewayKey: string
): RoutingRuleSpec {
  const rule = spec.properties;
  const index = services.index;

  const backendIp = index.dereference<AzurePrivateIP>(
    rule.backendIPConfiguration
  );

  const ruleSpec: RoutingRuleSpec = {
    destination: gatewayKey,
    constraints: {
      destinationPort: `${rule.frontendPort}`,
      protocol: rule.protocol,
      destinationIp: frontEndIp.properties.ipAddress,
    },
    override: {
      destinationIp: backendIp.properties.privateIPAddress,
    },
  };

  if (rule.backendPort !== rule.frontendPort) {
    ruleSpec.override!.destinationPort = `${rule.backendPort}`;
  }

  return ruleSpec;
}
