import {GraphSpec} from '../../graph';

import {AzureObjectIndex} from './azure_object_index';
import {
  AzureLoadBalancer,
  AzureLoadBalancerBackendPool,
  AzureNetworkInterface,
  AzurePrivateIP,
  AzureResourceGraph,
  AzureSubnet,
} from './azure_types';
import {GraphServices} from './graph_services';
import {normalizeCase} from './normalize_case';
import {SymbolTable} from './symbol_table';
import {unusedTypes} from './unused_types';

export interface ConversionResults {
  graph: GraphSpec;
  unusedTypes: Map<string, Set<string>>;
}

export function convert(
  resourceGraphSpec: AzureResourceGraph
): ConversionResults {
  //
  // Normalize casing in Azure Resource Graph type fields.
  //
  normalizeCase(resourceGraphSpec);

  //
  // Initialize GraphServices
  //
  const symbols = new SymbolTable([
    {
      dimension: 'ip',
      symbol: 'AzureLoadBalancer',
      range: '168.63.129.16',
    },
    {
      dimension: 'protocol',
      symbol: 'Tcp',
      range: 'tcp',
    },
    {
      dimension: 'protocol',
      symbol: 'TCP',
      range: 'tcp',
    },
  ]);
  const index = new AzureObjectIndex(resourceGraphSpec);
  const services = new GraphServices(index, {symbols});

  //
  // Initialize references
  //
  for (const nic of services.index.withType(AzureNetworkInterface)) {
    for (const ipConfig of nic.properties.ipConfigurations) {
      const subnet = ipConfig.properties.subnet;
      if (subnet) {
        const subnetSpec = services.index.dereference<AzureSubnet>(subnet);
        services.index.addReference(nic, subnet);
        services.index.allocator.registerSubnet(
          subnetSpec.id,
          subnetSpec.properties.addressPrefix
        );
        services.index.allocator.reserve(
          subnet.id,
          ipConfig.id,
          ipConfig.properties.privateIPAddress
        );
      }
    }
  }

  // Setup references between Load Balancers and their Subnet
  for (const lbSpec of index.withType(AzureLoadBalancer)) {
    const poolRef = lbSpec.properties?.backendAddressPools[0];

    if (poolRef) {
      const pool = index.dereference<AzureLoadBalancerBackendPool>(poolRef);
      const ipRef = pool.properties?.backendIPConfigurations[0];

      if (ipRef) {
        const ipConfig = index.dereference<AzurePrivateIP>(ipRef);
        const vnetId = index.getParentId(ipConfig.properties.subnet);
        services.index.addReference(lbSpec, vnetId);
      }
    }
  }

  //
  // Convert the AzureResourceGraph to a Labyrinth graph.
  //
  services.convert.resourceGraph(services);

  // Emit the GraphSpec
  const graph = services.getLabyrinthGraphSpec();

  return {
    graph,
    unusedTypes: unusedTypes(services, resourceGraphSpec),
  };
}
