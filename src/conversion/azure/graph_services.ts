import {GraphSpec} from '../../graph';

import {AzureObjectIndex} from './azure_object_index';
import {IConverters} from './converters';
import {NodeServices} from './node_services';
import {SymbolTable} from './symbol_table';

export class GraphServices {
  readonly index: AzureObjectIndex;
  readonly convert: IConverters;
  readonly nodes = new NodeServices();
  readonly symbols: SymbolTable;

  constructor(
    converters: IConverters,
    symbols: SymbolTable,
    index: AzureObjectIndex
  ) {
    this.convert = converters;
    this.symbols = symbols;
    this.index = index;
  }

  getLabyrinthGraphSpec(): GraphSpec {
    return {
      nodes: [...this.nodes.nodes()],
      symbols: this.symbols.getAllSymbolSpecs(),
    };
  }

  // TODO: eventually we will probably need some scope management
  // around the internet key, since it will be a different symbol,
  // depending on VNet context.
  getInternetKey() {
    return 'Internet';
  }
}
