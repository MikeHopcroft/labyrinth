import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../../graph';

import {
  AzureLoadBalancer,
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerInboundRule,
  AzureLoadBalancerRule,
  AzurePrivateIP,
} from '../azure_types';
import {GraphServices} from '../graph_services';

export function convertInternalLoadBalancer(
  services: GraphServices,
  spec: AzureLoadBalancer,
  vnetNodeKey: string
): SimpleRoutingRuleSpec {
  const loadBalancerKey = services.nodes.createKey(spec);
  const lbRoutes: RoutingRuleSpec[] = [];
  const ips: string[] = [];
  services.nodes.markTypeAsUsed(spec);

  for (const frontendSpec of spec.properties.frontendIPConfigurations) {
    if (!frontendSpec.properties.privateIPAddress) {
      throw new TypeError('Invalid load balancer IP configuration');
    }
    const ip = frontendSpec.properties.privateIPAddress;
    ips.push(ip);

    const route = services.convert.loadBalancerFrontend(
      services,
      frontendSpec,
      vnetNodeKey
    );

    lbRoutes.push(route);
  }

  services.nodes.add({
    key: loadBalancerKey,
    routes: lbRoutes,
  });

  return {
    destination: loadBalancerKey,
    constraints: {
      destinationIp: ips.join(','),
    },
  };
}

export function isInternalLoadBalancer(spec: AzureLoadBalancer): boolean {
  const ipConfig = spec.properties.frontendIPConfigurations[0];
  return (ipConfig && ipConfig.properties.privateIPAddress) !== undefined;
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
