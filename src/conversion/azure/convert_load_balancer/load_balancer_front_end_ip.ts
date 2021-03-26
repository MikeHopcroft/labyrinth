import {RoutingRuleSpec} from '../../../graph';

import {AzureLoadBalancerFrontEndIp} from '../azure_types';
import {GraphServices} from '../graph_services';

import {createLoadBalancerRoutes} from './internal_load_balancer';

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
