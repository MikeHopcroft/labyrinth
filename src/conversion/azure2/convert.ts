import {GraphSpec} from '../../graph';

import {AzureObjectIndex} from './azure_object_index';
import {IConverters} from './converters';
import {convertIp} from './convert_ip';
import {convertNIC} from './convert_nic';
import {convertNSG} from './convert_nsg';
import {convertResourceGraph} from './convert_resource_graph';
import {convertSubnet} from './convert_subnet';
import {convertVNet} from './convert_vnet';
import {GraphServices} from './graph_services';
import {NameShortener} from './name_shortener';
import {SymbolTable} from './symbol_table';
import {AzureNetworkInterface, AzureResourceGraph} from './types';
import {walkAzureObjectBases, walkAzureTypedObjects} from './walk';

// TODO: Move `converters` to own file.
export const converters: IConverters = {
  nic: convertNIC,
  resourceGraph: convertResourceGraph,
  subnet: convertSubnet,
  vnet: convertVNet,
  nsg: convertNSG,
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
  const services = new GraphServices(converters, symbols, index);

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
  // Convert the AzureResourceGraph
  //
  services.convert.resourceGraph(services);

  // Emit the GraphSpec
  const graph = services.getLabyrinthGraphSpec();

  return graph;
}

export const DefaultConverterConfig = converters;
