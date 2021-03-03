// TODO: remove this external dependency
import {IRules} from '../types';

import {convertNsg} from './convert_network_security_group';
import {GraphServices} from './graph_services';

import {
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureResourceGraph,
  AzureSubnet,
  AzureVirtualNetwork,
} from './types';

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
  subnet(services: GraphServices, spec: AzureSubnet, parent: string): string;
  vnet(services: GraphServices, spec: AzureVirtualNetwork): string;
  ip(services: GraphServices, spec: AzureIPConfiguration): string;
  nsg(
    services: GraphServices,
    spect: AzureNetworkSecurityGroup,
    vnetSymbol: string
  ): IRules;
}

export const defaultConverterMocks: IConverters = {
  resourceGraph: (services: GraphServices, spec: AzureResourceGraph) => {},
  subnet: (services: GraphServices, spec: AzureSubnet, vNetKey: string) =>
    `${spec.id}/${vNetKey}`,
  vnet: (services: GraphServices, spec: AzureVirtualNetwork) => spec.id,
  ip: (services: GraphServices, ip: AzureIPConfiguration) => {
    return ip.id;
  },
  nsg: convertNsg,
};

export function overrideDefaultCoverterMocks(overrides: Partial<IConverters>) {
  return {...defaultConverterMocks, ...overrides};
}
