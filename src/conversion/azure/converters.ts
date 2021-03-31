import {RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';
import {RuleSpec} from '../../rules';

import {
  AzureIPConfiguration,
  AzureLoadBalancer,
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzurePublicIP,
  AzureSubnet,
  AzureVirtualMachine,
  AzureVirtualNetwork,
} from './azure_types';
import {PublicIpRoutes} from './convert_public_ip';
import {GraphServices} from './graph_services';

export interface NSGRuleSpecs {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

export interface VNetResult {
  route: SimpleRoutingRuleSpec;
  publicRoutes: PublicIpRoutes;
}

// DESIGN NOTE: IConverters exists to allow mocking of individual
// converters with resorting to monkey patching.
//
export interface IConverters {
  loadBalancer(
    services: GraphServices,
    spec: AzureLoadBalancer,
    vnetKey: string
  ): SimpleRoutingRuleSpec | undefined;
  nic(
    services: GraphServices,
    spec: AzureNetworkInterface,
    outboundNodeKey: string,
    vnetSymbol: string
  ): SimpleRoutingRuleSpec;
  nsg(
    services: GraphServices,
    spec: AzureNetworkSecurityGroup | undefined,
    vnetSymbol: string
  ): NSGRuleSpecs;
  privateIp(
    services: GraphServices,
    spec: AzureIPConfiguration,
    outboundNodeKey: string
  ): SimpleRoutingRuleSpec;
  publicIp(
    services: GraphServices,
    spec: AzurePublicIP,
    backboneKey: string,
    internetKey: string
  ): PublicIpRoutes;
  resourceGraph(services: GraphServices): void;
  subnet(
    services: GraphServices,
    spec: AzureSubnet,
    outboundNodeKey: string,
    vnetSymbol: string
  ): SimpleRoutingRuleSpec;
  vm(
    services: GraphServices,
    spec: AzureVirtualMachine,
    outboundNicRoute: RoutingRuleSpec
  ): RoutingRuleSpec;
  vnet(
    services: GraphServices,
    spec: AzureVirtualNetwork,
    backboneOutboundKey: string,
    internetKey: string
  ): VNetResult;
}
