import {GraphSpec} from '../../graph';

import {AzureObjectIndex} from './azure_object_index';
import {AzureNetworkInterface, AzureResourceGraph} from './azure_types';
import {GraphServices} from './graph_services';
import {normalizeCase} from './normalize_case';
import {SymbolTable} from './symbol_table';

export function convert(resourceGraphSpec: AzureResourceGraph): GraphSpec {
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
        services.index.addReference(nic, subnet);
      }
    }
  }

  //
  // Convert the AzureResourceGraph to a Labyrinth graph.
  //
  services.convert.resourceGraph(services);

  // Emit the GraphSpec
  const graph = services.getLabyrinthGraphSpec();

  return graph;
}
