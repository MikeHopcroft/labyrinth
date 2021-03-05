import {walkAzureTypedObjects} from '../../../src/conversion/azure2';
import {NormalizedAzureGraph} from '../../../src/conversion/azure2/azure_graph_normalized';
import {GraphServices} from '../../../src/conversion/azure2/graph_services';
import {SymbolTable} from '../../../src/conversion/azure2/symbol_table';
import {AzureResourceGraph} from '../../../src/conversion/azure2/types';

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
