import {ActionType, Constraint, RuleSpec} from '../../rules/ruleSpec';
import {removeUndefinedProperties} from '../../utilities';

import {NSGRuleSpecs} from '../types';

import {noExplicitRelations, noOpMaterialize} from './convert_common';
import {normalizedSymbolKey, normalizedNodeKey} from './formatters';
import {
  AnyAzureObject,
  asSpec,
  AzureNetworkSecurityGroup,
  AzureObjectType,
  AzureSecurityRule,
  INetworkSecurityGroupNode,
  IReleatedX,
} from './types';

function convertRule(rule: AzureSecurityRule, vnetSymbol: string): RuleSpec {
  // const action = ActionType.ALLOW;
  //rule.properties.access === 'Allow' ? ActionType.ALLOW : ActionType.DENY;
  const priority = rule.properties.priority;

  // TODO: sourcePortRanges, sourceAddressPrefixes, etc.
  let sourceIp = rule.properties.sourceAddressPrefix;
  // TODO: consider using symbol table here instead of vnet.name.
  if (sourceIp === 'VirtualNetwork') {
    sourceIp = vnetSymbol;
  }

  const sourcePort = rule.properties.sourcePortRange;

  // TODO: destinationPortRanges, destinationAddressPrefixes, etc.
  let destinationIp = rule.properties.destinationAddressPrefix;
  // TODO: consider using symbol table here instead of vnet.name.
  if (destinationIp === 'VirtualNetwork') {
    destinationIp = vnetSymbol;
  }

  const destinationPort = rule.properties.destinationPortRange;
  const protocol = rule.properties.protocol;

  const spec: RuleSpec = {
    action: ActionType.ALLOW,
    priority,
    // TODO: set id and source fields correctly.
    id: 1,
    source: 'data/azure/resource-graph-1.json',
  };

  const constraints: Constraint = {};
  if (sourceIp) {
    constraints.sourceIp = sourceIp;
  }
  if (sourcePort) {
    constraints.sourcePort = sourcePort;
  }
  if (destinationIp) {
    constraints.destinationIp = destinationIp;
  }
  if (destinationPort) {
    constraints.destinationPort = destinationPort;
  }
  if (protocol) {
    constraints.protocol = protocol;
  }

  if (removeUndefinedProperties(constraints)) {
    spec.constraints = constraints;
  }

  return spec;
}

function writeRule(
  rule: AzureSecurityRule,
  vnetSymbol: string,
  inbound: RuleSpec[],
  outbound: RuleSpec[]
) {
  const r = convertRule(rule, vnetSymbol);
  if (rule.properties.direction === 'Inbound') {
    inbound.push(r);
  } else {
    outbound.push(r);
  }
}

export function convertRules(
  spec: AzureNetworkSecurityGroup,
  vnetSymbol: string
) {
  const inboundRules: RuleSpec[] = [];
  const outboudRules: RuleSpec[] = [];

  for (const rule of spec.properties.defaultSecurityRules) {
    writeRule(rule, vnetSymbol, inboundRules, outboudRules);
  }

  for (const rule of spec.properties.securityRules) {
    writeRule(rule, vnetSymbol, inboundRules, outboudRules);
  }

  return {
    outboundRules: outboudRules,
    inboundRules: inboundRules,
  };
}
export function createNetworkSecurityGroupNode(
  services: IReleatedX,
  input: AnyAzureObject
): INetworkSecurityGroupNode {
  const spec = asSpec<AzureNetworkSecurityGroup>(input, AzureObjectType.NSG);

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    relatedSpecIds: noExplicitRelations,
    materialize: noOpMaterialize,
    convertRules(vnetSymbol: string): NSGRuleSpecs {
      return convertRules(spec, vnetSymbol);
    },
  };
}
