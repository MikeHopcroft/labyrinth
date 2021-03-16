import {ActionType, Constraint, RuleSpec} from '../../rules';
import {removeUndefinedProperties} from '../../utilities';

import {AzureNetworkSecurityGroup, AzureSecurityRule} from './types';

interface IRules {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

export function convertNsg(
  nsg: AzureNetworkSecurityGroup,
  vnetSymbol: string
): IRules {
  const inboundRules: RuleSpec[] = [];
  const outboudRules: RuleSpec[] = [];

  for (const rule of nsg.properties.defaultSecurityRules) {
    writeRule(rule, vnetSymbol, inboundRules, outboudRules);
  }

  for (const rule of nsg.properties.securityRules) {
    writeRule(rule, vnetSymbol, inboundRules, outboudRules);
  }

  return {
    outboundRules: outboudRules,
    inboundRules: inboundRules,
  };
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

function convertRule(rule: AzureSecurityRule, vnetSymbol: string): RuleSpec {
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

// export function convertNsgRules(
//   nsgRef: AzureReference<AzureNetworkSecurityGroup>,
//   services: GraphServices,
//   vNetKey: string
// ): IRules | undefined {
//   if (nsgRef) {
//     const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
//       nsgRef
//     );

//     // FIX: vNetKey needs to be a symbol not just a node key
//     return services.convert.nsg(services, nsgSpec, vNetKey);
//   }

//   return undefined;
// }
