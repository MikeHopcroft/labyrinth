import {DefaultConverterConfig} from '../../../src/conversion/azure2/convert';
import {GraphServices} from '../../../src/conversion/azure2/graph_services';
import {SymbolTable} from '../../../src/conversion/azure2/symbol_table';

export class ServiceOracle {
  static InitializedGraphServices(): GraphServices {
    const converters = DefaultConverterConfig;
    const symbolTable = new SymbolTable([]);
    return new GraphServices(converters, symbolTable, []);
  }
}
