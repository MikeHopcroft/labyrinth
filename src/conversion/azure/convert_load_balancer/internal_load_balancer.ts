import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../../graph';

import {
  AzureLoadBalancer,
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerInboundRule,
  AzureLoadBalancerRule,
  AzurePrivateIP,
  AzurePublicIP,
} from '../azure_types';
import {GraphServices} from '../graph_services';

export function convertInternalLoadBalancer(
  services: GraphServices,
  spec: AzureLoadBalancer,
  vnetNodeKey: string
): SimpleRoutingRuleSpec {
  if (!spec.properties.frontendIPConfigurations[0]) {
    throw new TypeError('Unable to process load balancer');
  }

  const loadBalancerKey = services.nodes.createKey(spec);
  const lbRoutes: RoutingRuleSpec[] = [];
  const ips: string[] = [];
  services.nodes.markTypeAsUsed(spec);

  for (const frontendSpec of spec.properties.frontendIPConfigurations) {
    const ip = getIp(services, frontendSpec);

    if (ip) {
      ips.push(ip);

      const routes = createLoadBalancerRoutes(
        services,
        frontendSpec,
        ip,
        vnetNodeKey
      );

      lbRoutes.push(...routes);
    }
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
  destinationIp: string,
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

    routes.push(
      createInboundRoute(lbRule, destinationIp, backboneKey, ...backendIPs)
    );
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
        destinationIp,
        backboneKey,
        backendIp.properties.privateIPAddress
      )
    );
  }
  return routes;
}

function createInboundRoute(
  spec: AzureLoadBalancerRule,
  destinationIp: string,
  subnetKey: string,
  ...backendIps: string[]
): RoutingRuleSpec {
  const rule = spec.properties;

  const ruleSpec: RoutingRuleSpec = {
    destination: subnetKey,
    constraints: {
      destinationIp,
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

function getIp(
  services: GraphServices,
  spec: AzureLoadBalancerFrontEndIp
): string | undefined {
  let ip = spec.properties.privateIPAddress;

  if (!ip && spec.properties.publicIPAddress) {
    const publicIpSpec = services.index.dereference<AzurePublicIP>(
      spec.properties.publicIPAddress
    );
    ip = publicIpSpec.properties.ipAddress;
  }

  return ip;
}
