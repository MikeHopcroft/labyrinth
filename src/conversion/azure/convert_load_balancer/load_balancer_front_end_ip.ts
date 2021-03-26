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
  backboneKey: string
): RoutingRuleSpec {
  const key = services.nodes.createKey(spec);
  const routes = createLoadBalancerRoutes(services, spec, backboneKey);
  services.nodes.add({key, routes});
  return {destination: key};
}

export function createLoadBalancerRoutes(
  services: GraphServices,
  spec: AzureLoadBalancerFrontEndIp,
  backboneKey: string
): RoutingRuleSpec[] {
  services.nodes.markTypeAsUsed(spec);
  services.nodes.markTypeAsUsed(spec);

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

    routes.push(createInboundRoute(lbRule, backboneKey, ...backendIPs));
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
        backboneKey,
        backendIp.properties.privateIPAddress
      )
    );
  }
  return routes;
}

function createInboundRoute(
  spec: AzureLoadBalancerRule,
  subnetKey: string,
  ...backendIps: string[]
): RoutingRuleSpec {
  const rule = spec.properties;

  const ruleSpec: RoutingRuleSpec = {
    destination: subnetKey,
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
