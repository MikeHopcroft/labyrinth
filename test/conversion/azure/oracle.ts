import {walkAzureTypedObjects} from '../../../src/conversion/azure';
import {SymbolTable} from '../../../src/conversion/symbol_table';
import {AzureResourceGraph} from '../../../src/conversion/azure/types';
import {AzureNodeGraph} from '../../../src/conversion/azure/azure_node_graph';
import {IGraphServices} from '../../../src/conversion/types';

export class ServiceOracle {
  static InitializedGraphServices(
    spec: AzureResourceGraph = []
  ): IGraphServices {
    const symbolTable = new SymbolTable([]);
    const graph = new AzureNodeGraph(symbolTable);

    for (const item of walkAzureTypedObjects(spec)) {
      graph.observeRelationsAndRecord(item);
    }
    return graph;
  }
}
