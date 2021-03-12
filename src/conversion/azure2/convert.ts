import {GraphSpec} from '../../graph';

import {convertIp} from './convert_ip';
import {IConverters} from './converters';
import {convertResourceGraph} from './convert_resource_graph';
import {convertSubnet} from './convert_subnet';
import {convertVNet} from './convert_vnet';
import {convertNsg} from './convert_network_security_group';
import {GraphServices} from './graph_services';
import {NameShortener} from './name_shortener';
import {SymbolTable} from './symbol_table';
import {AzureNetworkInterface, AzureObjectType, AzureResourceGraph} from './types';

import {walkAzureObjectBases, walkAzureTypedObjects} from './walk';
import {AzureObjectIndex} from './azure_object_index';
import {AzureObjectGroups} from './azure_object_groups';

// TODO: Move `converters` to own file.
export const converters: IConverters = {
  resourceGraph: convertResourceGraph,
  subnet: convertSubnet,
  vnet: convertVNet,
  nsg: convertNsg,
  ip: convertIp,
};

export function convert(resourceGraphSpec: AzureResourceGraph): GraphSpec {
  //
  // Shorten names in graph.
  //

  // Populate shortener with ids from AzureTypedObjects.
  const shortener = new NameShortener();
  for (const item of walkAzureTypedObjects(resourceGraphSpec)) {
    shortener.add(item.id);
  }

  // Actually shorten names
  // TODO: this needs to convert references in addition to AnyAzureObjects
  // REVIEW: what if we need the old id and the new id in the node.
  for (const item of walkAzureObjectBases(resourceGraphSpec)) {
    item.id = shortener.shorten(item.id);
  }

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
  const groups = new AzureObjectGroups(resourceGraphSpec);
  const services = new GraphServices(converters, symbols, groups, index);

  //
  // Initialize references
  //
  for (const nic of services.groups.items<AzureNetworkInterface>(AzureObjectType.NIC)) {
  }

  //
  // Convert the AzureResourceGraph
  //
  // Could also write
  //   converters.resourceGraph(services, resourceGraph);
  services.convert.resourceGraph(services, resourceGraphSpec);

  // Emit the GraphSpec
  const graph = services.getLabyrinthGraphSpec();

  return graph;
}

export const DefaultConverterConfig = converters;
