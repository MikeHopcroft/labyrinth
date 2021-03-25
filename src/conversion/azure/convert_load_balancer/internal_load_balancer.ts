import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../../graph';

import {AzureLoadBalancer} from '../azure_types';
import {GraphServices} from '../graph_services';

export function convertInternalLoadBalancer(
  services: GraphServices,
  spec: AzureLoadBalancer,
  vnetNodeKey: string
): SimpleRoutingRuleSpec {
  const loadBalancerKey = services.nodes.createKey(spec);
  const lbRoutes: RoutingRuleSpec[] = [];
  const ips: string[] = [];

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
