import {GraphSpec, SymbolDefinitionSpec} from '../../graph';

import {GraphServices, IConverters} from './graph_services';
import {NameShortener} from './name_shortener';
import {resourceGraph} from './resource_graph';
import {subnet} from './subnet';
import {AzureResourceGraph} from './types';
import {vnet} from './vnet';
import {walk} from './walk';

const converters: IConverters = {
  resourceGraph,
  subnet,
  vnet,
};

export function convert(root: AzureResourceGraph): GraphSpec {
  //
  // Shorten names in graph.
  //

  // Populate shortener
  const shortener = new NameShortener();
  for (const item of walk(root)) {
    shortener.add(item.id);
  }

  // Actually shorten names
  for (const item of walk(root)) {
    item.id = shortener.shorten(item.id);
  }

  //
  // Initialize the GraphBuilder/GraphServices
  //
  const symbols: SymbolDefinitionSpec[] = [
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
  ];
  const services = new GraphServices(converters, symbols, root);

  //
  // Convert the AzureResourceGraph
  //
  services.convert.resourceGraph(services, root);

  // Emit the GraphSpec
  const graph = services.getLabyrinthGraphSpec();

  return graph;
}
