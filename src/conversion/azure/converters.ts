import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';
import {RuleSpec} from '../../rules';

import {
  AzureIPConfiguration,
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzureSubnet,
  AzureVirtualMachine,
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
  vm(
    services: GraphServices,
    spec: AzureVirtualMachine,
    parent: string
  ): RoutingRuleSpec;
}
