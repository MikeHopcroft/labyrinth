import {RoutingRuleSpec} from '../../../graph';

import {
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerInboundRule,
  AzureLoadBalancerRule,
  AzurePrivateIP,
} from '../azure_types';

import {GraphServices} from '../graph_services';

export function convertLoadBalancerFrontEndIp(
  services: GraphServices,
  spec: AzureLoadBalancerFrontEndIp,
  gatewayKey: string
): RoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  const key = services.nodes.createKey(spec);

  const routes: RoutingRuleSpec[] = [];

  for (const lbRuleRef of spec.properties.loadBalancingRules ?? []) {
    const lbRule = services.index.dereference<AzureLoadBalancerInboundRule>(
      lbRuleRef
    );
    services.nodes.markTypeAsUsed(lbRule);

    const backendPool = services.index.dereference<AzureLoadBalancerBackendPool>(
      lbRule.properties.backendAddressPool
    );
    services.nodes.markTypeAsUsed(backendPool);

    const backendIPs = backendPool.properties.backendIPConfigurations.map(
      ip =>
        services.index.dereference<AzurePrivateIP>(ip).properties
          .privateIPAddress
    );

    routes.push(createInboundRoute(lbRule, gatewayKey, ...backendIPs));
  }

  for (const natRuleSpec of spec.properties.inboundNatRules ?? []) {
    const natRule = services.index.dereference<AzureLoadBalancerInboundNatRule>(
      natRuleSpec
    );
    services.nodes.markTypeAsUsed(natRule);

    const backendIp = services.index.dereference<AzurePrivateIP>(
      natRule.properties.backendIPConfiguration
    );
    services.nodes.markTypeAsUsed(backendIp);

    routes.push(
      createInboundRoute(
        natRule,
        gatewayKey,
        backendIp.properties.privateIPAddress
      )
    );
  }

  services.nodes.add({key, routes});

  return {destination: key};
}

function createInboundRoute(
  spec: AzureLoadBalancerRule,
  gatewayKey: string,
  ...backendIps: string[]
): RoutingRuleSpec {
  const rule = spec.properties;

  const ruleSpec: RoutingRuleSpec = {
    destination: gatewayKey,
    constraints: {
      destinationPort: rule.frontendPort.toString(),
      protocol: rule.protocol,
    },
    override: {
      destinationIp: backendIps.join(','),
    },
  };

  if (rule.backendPort !== rule.frontendPort) {
    ruleSpec.override!.destinationPort = rule.backendPort.toString();
  }

  return ruleSpec;
}
