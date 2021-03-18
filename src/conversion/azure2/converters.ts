import {SimpleRoutingRuleSpec} from '../../graph';
import {RuleSpec} from '../../rules';

import {
  AzureIPConfiguration,
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureVirtualNetwork,
} from './azure_types';

import {GraphServices} from './graph_services';

// export interface NodeKeyAndDestinationIp {
//   key: string;
//   destinationIp: string;
// }

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
  nic(
    services: GraphServices,
    spec: AzureNetworkInterface,
    parent: string,
    vnetSymbol: string
  ): SimpleRoutingRuleSpec;
  resourceGraph(services: GraphServices): void;
  subnet(
    services: GraphServices,
    spec: AzureSubnet,
    parent: string,
    vnetSymbol: string
  ): SimpleRoutingRuleSpec;
  vnet(
    services: GraphServices,
    spec: AzureVirtualNetwork
  ): SimpleRoutingRuleSpec;
  ip(
    services: GraphServices,
    spec: AzureIPConfiguration,
    parent: string
  ): SimpleRoutingRuleSpec;
  nsg(
    spec: AzureNetworkSecurityGroup | undefined,
    vnetSymbol: string
  ): NSGRuleSpecs;
}
