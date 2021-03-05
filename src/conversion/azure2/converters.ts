import {RuleSpec} from '../../rules';

import {convertNsg} from './convert_network_security_group';
import {GraphServices} from './graph_services';

import {
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureResourceGraph,
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
    vnetNodeKey: string
  ): NodeKeyAndSourceIp;
  vnet(services: GraphServices, spec: AzureVirtualNetwork): NodeKeyAndSourceIp;
  ip(services: GraphServices, spec: AzureIPConfiguration): NodeKeyAndSourceIp;
  nsg(
    services: GraphServices,
    spec: AzureNetworkSecurityGroup,
    vnetSymbol: string
  ): NSGRuleSpecs;
}

export const defaultConverterMocks: IConverters = {
  resourceGraph: (services: GraphServices, spec: AzureResourceGraph) => {},
  subnet: (services: GraphServices, spec: AzureSubnet, vNetKey: string) =>
    // TODO: this is confusing. Returning vNetKey in destinationIp so that
    // unit tests can verify vNetKey.
    ({key: spec.id, destinationIp: `${vNetKey}`}),
  vnet: (services: GraphServices, spec: AzureVirtualNetwork) => ({
    key: spec.id,
    destinationIp: 'xyz',
  }),
  ip: (services: GraphServices, spec: AzureIPConfiguration) => ({
    key: spec.id,
    destinationIp: 'xyz',
  }),
  // TODO: nsg should be a mock.
  nsg: convertNsg,
};

export function overrideDefaultCoverterMocks(overrides: Partial<IConverters>) {
  return {...defaultConverterMocks, ...overrides};
}
