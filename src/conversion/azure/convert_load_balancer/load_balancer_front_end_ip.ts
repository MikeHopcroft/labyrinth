import {RoutingRuleSpec} from '../../../graph';

import {
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerInboundRule,
  AzureLoadBalancerRule,
  AzurePrivateIP,
  AzurePublicIP,
} from '../azure_types';
import {PublicIpRoutes} from '../convert_public_ip';
import {GraphServices} from '../graph_services';

export function convertLoadBalancerFrontEndIp(
  services: GraphServices,
  spec: AzureLoadBalancerFrontEndIp,
  publicIpSpec: AzurePublicIP,
  gatewayKey: string
): PublicIpRoutes {
  const inbound: RoutingRuleSpec[] = [];

  for (const lbRuleRef of spec.properties.loadBalancingRules ?? []) {
    const lbRule = services.index.dereference<AzureLoadBalancerInboundRule>(
      lbRuleRef
    );
    const backendPool = services.index.dereference<AzureLoadBalancerBackendPool>(
      lbRule.properties.backendAddressPool
    );

    const backendIPs = backendPool.properties.backendIPConfigurations.map(
      ip =>
        services.index.dereference<AzurePrivateIP>(ip).properties
          .privateIPAddress
    );

    inbound.push(
      createInboundRoute(lbRule, publicIpSpec, gatewayKey, ...backendIPs)
    );
  }

  for (const natRuleSpec of spec.properties.inboundNatRules ?? []) {
    const natRule = services.index.dereference<AzureLoadBalancerInboundNatRule>(
      natRuleSpec
    );
    const backendIp = services.index.dereference<AzurePrivateIP>(
      natRule.properties.backendIPConfiguration
    );

    inbound.push(
      createInboundRoute(
        natRule,
        publicIpSpec,
        gatewayKey,
        backendIp.properties.privateIPAddress
      )
    );
  }

  return {inbound, outbound: []};
}

function createInboundRoute(
  spec: AzureLoadBalancerRule,
  frontEndIp: AzurePublicIP,
  gatewayKey: string,
  ...backendIps: string[]
): RoutingRuleSpec {
  const rule = spec.properties;

  const ruleSpec: RoutingRuleSpec = {
    destination: gatewayKey,
    constraints: {
      destinationPort: `${rule.frontendPort}`,
      protocol: rule.protocol,
      destinationIp: frontEndIp.properties.ipAddress,
    },
    override: {
      destinationIp: backendIps.join(','),
    },
  };

  if (rule.backendPort !== rule.frontendPort) {
    ruleSpec.override!.destinationPort = `${rule.backendPort}`;
  }

  return ruleSpec;
}
