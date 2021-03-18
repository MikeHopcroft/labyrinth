import {GraphSpec, NodeSpec} from '../../graph';
import {AzureObjectIndex} from './azure_object_index';

import {IConverters} from './converters';
import {NodeKeyGenerator} from './node_key_generator';
import {SymbolTable} from './symbol_table';

export class GraphServices {
  readonly ids = new NodeKeyGenerator();
  readonly index: AzureObjectIndex;
  readonly convert: IConverters;
  private readonly nodes: NodeSpec[] = [];
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

  // Add a Labyrinth node to the generated graph.
  addNode(node: NodeSpec) {
    this.nodes.push(node);
  }

  getLabyrinthGraphSpec(): GraphSpec {
    return {nodes: this.nodes, symbols: this.symbols.getAllSymbolSpecs()};
  }

  // TODO: eventually we will probably need some scope management
  // around the internet key, since it will be a different symbol,
  // depending on VNet context.
  getInternetKey() {
    return 'Internet';
  }
}
