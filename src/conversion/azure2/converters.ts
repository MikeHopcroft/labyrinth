import {RoutingRuleSpec} from '../../graph';
import {RuleSpec} from '../../rules';

import {GraphServices} from './graph_services';

import {
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureVirtualNetwork,
} from './types';

export interface NodeKeyAndSourceIp {
  key: string;
  destinationIp: string;
}

export interface NSGRuleSpecs {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

// DESIGN NOTE: IConverters exists to allow mocking of individual
// converters with resorting to monkey patching.
//
// DESIGN ALTERNATIVE (for converter return value):
// Instead of returning identifier that is both the node key and
// the service tag, return an object
//   {
//     inboundKey: string,
//     outboundKey: string,
//     range: DRange or string expression?
//   }
export interface IConverters {
  resourceGraph(services: GraphServices): void;
  subnet(
    services: GraphServices,
    spec: AzureSubnet,
    parent: string
  ): NodeKeyAndSourceIp;
  vnet(services: GraphServices, spec: AzureVirtualNetwork): NodeKeyAndSourceIp;
  ip(services: GraphServices, spec: AzureIPConfiguration): RoutingRuleSpec;
  nsg(
    services: GraphServices,
    spec: AzureNetworkSecurityGroup,
    vnetSymbol: string
  ): NSGRuleSpecs;
}
