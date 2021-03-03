import {AzureObjectIndex} from '../../../src/conversion/azure2/azure_object_index';
import {DefaultConverterConfig} from '../../../src/conversion/azure2/convert';
import {GraphServices} from '../../../src/conversion/azure2/graph_services';
import {SymbolTable} from '../../../src/conversion/azure2/symbol_table';
import {AzureResourceGraph} from '../../../src/conversion/azure2/types';

export class ServiceOracle {
  static InitializedGraphServices(
    spec: AzureResourceGraph = []
  ): GraphServices {
    const converters = DefaultConverterConfig;
    const symbolTable = new SymbolTable([]);
    const index = new AzureObjectIndex(spec);
    return new GraphServices(converters, symbolTable, index);
  }
}
