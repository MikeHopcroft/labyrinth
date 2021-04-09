import {ActionType, Constraint, RuleSpec} from '../../rules';
import {removeUndefinedProperties} from '../../utilities';

import {AzureNetworkSecurityGroup, AzureSecurityRule} from './azure_types';
import {GraphServices} from './graph_services';

interface IRules {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

export function convertNSG(
  services: GraphServices,
  spec: AzureNetworkSecurityGroup,
  vnetSymbol: string
): IRules {
  services.nodes.markTypeAsUsed(spec);

  const inboundRules: RuleSpec[] = [];
  const outboudRules: RuleSpec[] = [];

  for (const rule of spec.properties.securityRules.sort(sortByPriority)) {
    writeRule(services, rule, vnetSymbol, inboundRules, outboudRules);
  }

  for (const rule of spec.properties.defaultSecurityRules.sort(
    sortByPriority
  )) {
    writeRule(services, rule, vnetSymbol, inboundRules, outboudRules);
  }

  return {
    outboundRules: outboudRules,
    inboundRules: inboundRules,
  };
}

function sortByPriority(a: AzureSecurityRule, b: AzureSecurityRule): number {
  if (a.properties.priority === b.properties.priority) {
    return 0;
  } else if (a.properties.priority >= b.properties.priority) {
    return 1;
  } else {
    return -1;
  }
}

function writeRule(
  services: GraphServices,
  rule: AzureSecurityRule,
  vnetSymbol: string,
  inbound: RuleSpec[],
  outbound: RuleSpec[]
) {
  const r = convertRule(services, rule, vnetSymbol);
  if (rule.properties.direction === 'Inbound') {
    inbound.push(r);
  } else {
    outbound.push(r);
  }
}

function convertRule(
  services: GraphServices,
  rule: AzureSecurityRule,
  vnetSymbol: string
): RuleSpec {
  services.nodes.markTypeAsUsed(rule);

  const action =
    rule.properties.access === 'Allow' ? ActionType.ALLOW : ActionType.DENY;
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
