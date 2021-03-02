import {Graph, GraphSpec, SymbolDefinitionSpec} from '../../graph';

import {GraphBuilder, IConverters} from './graph_builder';
import { NameShortener } from './name_shortener';

import {
  AnyAzureObject,
  AzureObjectType,
  AzureSubnet,
  AzureVirtualNetwork
} from './types';

import {walk} from './walk';

export function asAzureVirtualNetwork(
  item: AnyAzureObject,
): AzureVirtualNetwork | null {
  return item.type === AzureObjectType.VIRTUAL_NETWORK ? item : null;
}

interface ResourceGraphVisitor {
  builder: GraphBuilder,
  // idToAzureObject: Map<string, AnyAzureObject>,
  // nodes: NodeSpec[],
  converters: IConverters
}

// DESIGN ALTERNATIVE:
// Instead of returning identifier that is node key and service tag, return
// an object
//   {
//     inboundKey: string,
//     outboundKey: string,
//     range: DRange or string expression?
//   }
const converters: IConverters = {
  vnet(visitor: ResourceGraphVisitor, spec: AzureVirtualNetwork): string {
    // For each subnet
    //   Materialize subnet
    //   Add routing rule from vnet to subnet
    return 'vnet';
  },

  subnet(builder: GraphBuilder, converters: IConverters, spec: AzureSubnet, vNetKey: string): string {
    // For each ipConfiguration
    //   Materialize ipConfiguration
    //   Add routing rule
    return 'subnet';
  }
}

function convert(root: AnyAzureObject[]): GraphSpec {
  //
  // Shorten names in graph.
  //


  // Initialize the graph builder
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
    }
  ];

  const builder = new GraphBuilder(converters, symbols, root);

  // for (const vnet of builder.items<AzureVirtualNetwork>(AzureObjectType.VIRTUAL_NETWORK)) {
  // }

  // for (const vnet of builder.vnets()) {
  // }

  // Walk over items in root, looking for vnets to process
  // for (const item of builder.idToAzureObject.values()) {
  for (const item of root) {
    const vnet = asAzureVirtualNetwork(item);
    if (vnet) {
      // process vnet
      const key = builder.convert.vnet(builder, vnet);
      // keep list of vnet keys
    }
  }

  // Emit the GraphSpec
  const graph = builder.getLabyrinthGraphSpec();

  // TODO: How does this renaming really work - for expressions?
  //   // Populate shortener
  //   const shortener = new NameShortener();
  //   for (const item of walk(root)) {
  //     shortener.add(item.id);
  //   }
  
  //   for (const item of walk(root)) {
  //     item.id = shortener.shorten(item.id);
  //   }
  
  //   for (const node of graph.nodes) {
  //     renameNode(node, shortener.shorten(node.key));
  //   }

  return graph;
}
