import {RoutingRuleSpec} from '../../../graph';
import {noOpMaterialize} from '../convert_common';
import {normalizedSymbolKey, normalizedNodeKey} from '../formatters';

import {
  AzureLoadBalancerRule,
  ILoadBalancerRuleNode,
  IReleatedX,
} from '../types';
import {commonTypes} from './load_balancer_common';

// TODO: Move into constants
const AzureLoadBalancerSymbol = 'AzureLoadBalancer';

function* relatedRuleItems(spec: AzureLoadBalancerRule) {
  yield spec.properties.frontendIPConfiguration.id;
  yield spec.properties.backendAddressPool.id;
}

export function createLoadBalancerRuleNode(
  services: IReleatedX,
  spec: AzureLoadBalancerRule
): ILoadBalancerRuleNode {
  const common = commonTypes(spec, services);

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    frontEndIp: common.frontEndIp,
    backendPool: common.backendPool,
    relatedSpecIds: () => {
      return relatedRuleItems(spec);
    },
    materialize: noOpMaterialize,
    convertToRoute: () => {
      const rule = spec.properties;

      const backEndPool = common.backendPool();

      // TODO: Handle pool. . .
      const ruleSpec: RoutingRuleSpec = {
        destination: backEndPool.subnet().nodeKey,
        constraints: {
          destinationPort: `${rule.frontendPort}`,
          protocol: rule.protocol,
          destinationIp: common.frontEndIp().ip().ipAddress,
        },
        override: {
          destinationIp: backEndPool.serviceTag,
          sourceIp: AzureLoadBalancerSymbol,
        },
      };

      if (rule.backendPort !== rule.frontendPort) {
        ruleSpec.override!.destinationPort = `${rule.backendPort}`;
      }

      return ruleSpec;
    },
  };
}
