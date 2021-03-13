import {RoutingRuleSpec} from '../../../graph';
import {IMaterializedResult} from '../../types';

import {normalizedSymbolKey, normalizedNodeKey} from '../formatters';
import {
  AzureLoadBalancer,
  AzureObjectType,
  ILoadBalancerRuleNode,
  ILoadBalancerNATRule,
  ILoadBalancerNode,
  IReleatedX,
} from '../types';

function* relatedLoadBalancerItemKeys(
  spec: AzureLoadBalancer
): IterableIterator<string> {
  for (const rule of spec.properties.loadBalancingRules) {
    yield rule.id;
  }

  for (const rule of spec.properties.inboundNatRules) {
    yield rule.id;
  }
}
function materializeLoadBalancer(node: ILoadBalancerNode): IMaterializedResult {
  const loadBalancerNodeKey = node.nodeKey;
  const loadBalancerServiceTag = node.serviceTag;

  const routes: RoutingRuleSpec[] = [];
  const frontEndIps = new Set<string>();

  for (const lbRule of node.balancingRules()) {
    routes.push(lbRule.convertToRoute());
    frontEndIps.add(lbRule.frontEndIp().ip().ipAddress);
  }

  for (const natRule of node.balancingRules()) {
    routes.push(natRule.convertToRoute());
    frontEndIps.add(natRule.frontEndIp().ip().ipAddress);
  }

  return {
    nodes: [
      {
        key: loadBalancerNodeKey,
        routes,
      },
    ],
    serviceTags: [
      {
        tag: loadBalancerServiceTag,
        value: [...frontEndIps.values()].join(','),
      },
    ],
  };
}

export function createLoadBalancerNode(
  services: IReleatedX,
  spec: AzureLoadBalancer
): ILoadBalancerNode {
  const node = {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    natRules: () => {
      return services.getRelated<ILoadBalancerNATRule>(
        spec,
        AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND
      );
    },
    balancingRules: () => {
      return services.getRelated<ILoadBalancerRuleNode>(
        spec,
        AzureObjectType.LOAD_BALANCER_RULE
      );
    },
    relatedSpecIds: () => {
      return relatedLoadBalancerItemKeys(spec);
    },
    materialize: () => {
      return materializeLoadBalancer(node);
    },
  };

  return node;
}
