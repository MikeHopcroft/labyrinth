import {walkAzureTypedObjects} from '../../../src/conversion/azure';
import {NormalizedAzureGraph} from '../../../src/conversion/azure/azure_graph_normalized';
import {GraphServices} from '../../../src/conversion/azure/graph_services';
import {SymbolTable} from '../../../src/conversion/azure/symbol_table';
import {AzureResourceGraph} from '../../../src/conversion/azure/types';

export class ServiceOracle {
  static InitializedGraphServices(
    spec: AzureResourceGraph = []
  ): GraphServices {
    const symbolTable = new SymbolTable([]);
    const graph = new NormalizedAzureGraph();

    for (const item of walkAzureTypedObjects(spec)) {
      graph.addNode(item);
    }
    return new GraphServices(symbolTable, graph);
  }
}
