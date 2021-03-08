import {GraphSpec, NodeSpec} from '../../graph';
import {NormalizedAzureGraph} from './azure_graph_normalized';

import {SymbolTable} from '../symbol_table';

export class GraphServices {
  readonly index: NormalizedAzureGraph;
  private readonly nodes: NodeSpec[] = [];
  readonly symbols: SymbolTable;

  constructor(symbols: SymbolTable, index: NormalizedAzureGraph) {
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
