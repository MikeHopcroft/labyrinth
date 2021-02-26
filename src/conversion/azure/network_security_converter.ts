import {ActionType, Constraint, RuleSpec} from '../../rules';
import {removeUndefinedProperties} from '../../utilities';

import {IRules} from '..';

import {
  AzureNetworkSecurityGroup,
  AzureSecurityRule,
  AzureVirtualNetwork,
} from '.';

function convertRule(
  vnet: AzureVirtualNetwork,
  rule: AzureSecurityRule
): RuleSpec {
  const action =
    rule.properties.access === 'Allow' ? ActionType.ALLOW : ActionType.DENY;
  const priority = rule.properties.priority;

  // TODO: sourcePortRanges, sourceAddressPrefixes, etc.
  let sourceIp = rule.properties.sourceAddressPrefix;
  // TODO: consider using symbol table here instead of vnet.name.
  if (sourceIp === 'VirtualNetwork') {
    sourceIp = vnet.name;
  }

  const sourcePort = rule.properties.sourcePortRange;

  // TODO: destinationPortRanges, destinationAddressPrefixes, etc.
  let destinationIp = rule.properties.destinationAddressPrefix;
  // TODO: consider using symbol table here instead of vnet.name.
  if (destinationIp === 'VirtualNetwork') {
    destinationIp = vnet.name;
  }

  const destinationPort = rule.properties.destinationPortRange;
  const protocol = rule.properties.protocol;

  const spec: RuleSpec = {
    action,
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

function createNetworkSecurityGroupRules(
  nsg: AzureNetworkSecurityGroup,
  vnet: AzureVirtualNetwork
): IRules {
  const inboundRules: RuleSpec[] = [];
  const outboudRules: RuleSpec[] = [];

  for (const rule of nsg.properties.defaultSecurityRules) {
    const r = convertRule(vnet, rule);
    if (rule.properties.direction === 'Inbound') {
      inboundRules.push(r);
    } else {
      outboudRules.push(r);
    }
  }

  for (const rule of nsg.properties.securityRules) {
    const r = convertRule(vnet, rule);
    if (rule.properties.direction === 'Inbound') {
      inboundRules.push(r);
    } else {
      outboudRules.push(r);
    }
  }

  return {
    outboundRules: outboudRules,
    inboundRules: inboundRules,
  };
}

export const NSG = {
  parseRules: createNetworkSecurityGroupRules,
};
