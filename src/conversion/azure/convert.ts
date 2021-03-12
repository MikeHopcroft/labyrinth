import {GraphSpec} from '../../graph';
import {Comparers, SetX} from '../../collections';

import {SymbolTable} from '../symbol_table';

import {AzureObjectType, AzureResourceGraph, AzureTypedObject} from './types';
import {walkAzureObjectBases} from './walk';
import {AzureNodeGraph} from './azure_node_graph';
import {isValidVMSSIpConfigId, isValidVMSSIpNic} from './convert_vmss';

export function typedSpec(id: string, type: AzureObjectType): AzureTypedObject {
  return {
    id,
    type,
    resourceGroup: 'virtual',
    name: '',
  };
}

function hasValidSpecType(spec: AzureTypedObject) {
  return spec.type !== undefined && spec.type.length > 0;
}

export function convert(resourceGraphSpec: AzureResourceGraph): GraphSpec {
  // Initialize GraphServices

  // TODO: This really should move elsewhere..
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

  const azureGraph = new AzureNodeGraph(symbols);

  // Map the id of everything created to avoid attempting to create
  // items multiple times given the first walk traverses every item
  // including references only.
  const realizedItem = new SetX<string>(Comparers.CaseInsensitive);

  // Pending references need to be storeds as there are items like
  // VMSS IP and NIC which cannot be created until their VMSS has
  // been observed and stored. The simple approach is to observe,
  // create and index everything possible in the first pass, then
  // attempt to index any remaining items stored in pending.
  const pendingReferences = new SetX<string>(Comparers.CaseInsensitive);

  function realizeItem(id: string, spec: AzureTypedObject) {
    azureGraph.observeRelationsAndRecord(spec);
    realizedItem.add(id);
    pendingReferences.delete(id);
  }

  // Build the itermediate nodes and relationships
  for (const spec of walkAzureObjectBases(resourceGraphSpec)) {
    const id = spec.id;

    if (!realizedItem.has(id)) {
      pendingReferences.add(id);

      if (hasValidSpecType(spec)) {
        realizeItem(id, spec);
      }
    }
  }

  // Handle pending references
  for (const pendingReference of pendingReferences.values()) {
    if (isValidVMSSIpConfigId(pendingReference)) {
      realizeItem(
        pendingReference,
        typedSpec(pendingReference, AzureObjectType.VMSS_VIRTUAL_IP)
      );
    } else if (isValidVMSSIpNic(pendingReference)) {
      realizeItem(
        pendingReference,
        typedSpec(pendingReference, AzureObjectType.VMSS_VIRTUAL_NIC)
      );
    }
  }

  // Materialize Labyrinth nodes and the graph
  for (const node of azureGraph.nodeIterator()) {
    node.materialize(azureGraph, node);
  }

  // Emit the GraphSpec
  const graph = azureGraph.getLabyrinthGraphSpec();

  return graph;
}
