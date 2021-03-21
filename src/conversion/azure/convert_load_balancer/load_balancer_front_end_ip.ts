import {RoutingRuleSpec} from '../../../graph';

import {
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerRule,
  AzurePublicIP,
} from '../azure_types';
import {PublicIpRoutes} from '../convert_public_ip';
import {GraphServices} from '../graph_services';

import {createNatRoute} from './load_balancer_nat_rule';
import {createLoadBalancingRuleRoute} from './load_balancer_rule';

export function convertLoadBalancerFrontEndIp(
  services: GraphServices,
  spec: AzureLoadBalancerFrontEndIp,
  publicIpSpec: AzurePublicIP,
  gatewayKey: string
): PublicIpRoutes {
  const inbound: RoutingRuleSpec[] = [];

  for (const lbRuleRef of spec.properties.loadBalancingRules ?? []) {
    const lbRule = services.index.dereference<AzureLoadBalancerRule>(lbRuleRef);
    inbound.push(
      createLoadBalancingRuleRoute(services, lbRule, publicIpSpec, gatewayKey)
    );
  }

  for (const natRuleSpec of spec.properties.inboundNatRules ?? []) {
    const natRule = services.index.dereference<AzureLoadBalancerInboundNatRule>(
      natRuleSpec
    );
    inbound.push(createNatRoute(services, natRule, publicIpSpec, gatewayKey));
  }

  return {inbound, outbound: []};
}
