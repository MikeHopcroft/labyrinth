import {RuleSpec} from '../../rules';
import {IpNode} from './convert_ip';
import {LoadBalancerNode} from './convert_load_balancer';

import {VirtualNetworkNode} from './convert_vnet';
import {GraphServices} from './graph_services';

import {AzureResourceGraph, AzureSubnet} from './types';

export interface NodeKeyAndSourceIp {
  key: string;
  destinationIp: string;
}

export interface NSGRuleSpecs {
  readonly outboundRules: RuleSpec[];
  readonly inboundRules: RuleSpec[];
}

// DESIGN ALTERNATIVE (for converter return value):
// Instead of returning identifier that is both the node key and
// the service tag, return an object
//   {
//     inboundKey: string,
//     outboundKey: string,
//     range: DRange or string expression?
//   }
export interface IConverters {
  resourceGraph(services: GraphServices, spec: AzureResourceGraph): void;
  subnet(
    services: GraphServices,
    spec: AzureSubnet,
    parent: string
  ): NodeKeyAndSourceIp;
  vnet(services: GraphServices, spec: VirtualNetworkNode): NodeKeyAndSourceIp;
  ip(services: GraphServices, spec: IpNode): NodeKeyAndSourceIp;
  loadBalancer(
    services: GraphServices,
    spec: LoadBalancerNode
  ): NodeKeyAndSourceIp;
}
