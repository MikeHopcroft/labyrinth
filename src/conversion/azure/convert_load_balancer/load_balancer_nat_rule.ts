import {RoutingRuleSpec} from '../../../graph';
import {noOpMaterialize} from '../convert_common';
import {normalizedNodeKey, normalizedSymbolKey} from '../formatters';

import {
  AzureLoadBalancerInboundNatRule,
  AzureObjectType,
  AnyAzureObject,
  asSpec,
  ILoadBalancerNATRule,
  IReleatedX,
} from '../types';
import {commonTypes} from './load_balancer_common';

// TODO: Move into constants
const AzureLoadBalancerSymbol = 'AzureLoadBalancer';

function* relatedNatRuleItems(spec: AzureLoadBalancerInboundNatRule) {
  yield spec.properties.frontendIPConfiguration.id;
  yield spec.properties.backendIPConfiguration.id;
}

export function createLoadBalancerNatRuleNode(
  services: IReleatedX,
  input: AnyAzureObject
): ILoadBalancerNATRule {
  const spec = asSpec<AzureLoadBalancerInboundNatRule>(
    input,
    AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND
  );
  const common = commonTypes(spec, services);

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    frontEndIp: common.frontEndIp,
    backEnd: common.backendIp,
    relatedSpecIds: () => {
      return relatedNatRuleItems(spec);
    },
    materialize: noOpMaterialize,
    convertToRoute: () => {
      const rule = spec.properties;

      const backendIp = common.backendIp();

      const ruleSpec: RoutingRuleSpec = {
        destination: backendIp.nodeKey,
        constraints: {
          destinationPort: `${rule.frontendPort}`,
          protocol: rule.protocol,
          destinationIp: common.frontEndIp().ip().ipAddress,
        },
        override: {
          destinationIp: backendIp.serviceTag,
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
