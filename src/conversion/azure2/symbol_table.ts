import {SymbolDefinitionSpec} from '../../graph';

export const serviceTagDimensionKey = 'ip';

export class SymbolTable {
  private readonly symbolToSpec = new Map<string, SymbolDefinitionSpec>();

  constructor(symbols: SymbolDefinitionSpec[]) {
    for (const spec of symbols) {
      this.addSpec(spec);
    }
  }

  defineSymbol(dimension: string, symbol: string, range: string) {
    this.addSpec({dimension, symbol, range});
  }

  defineServiceTag(tagName: string, range: string) {
    this.defineSymbol(serviceTagDimensionKey, tagName, range);
  }

  getSymbolSpec(): SymbolDefinitionSpec[] {
    return [...this.symbolToSpec.values()];
  }

  private addSpec(spec: SymbolDefinitionSpec) {
    if (this.symbolToSpec.has(spec.symbol)) {
      const message = `Duplicate symbol "${spec.symbol}"`;
      throw new TypeError(message);
    }
    this.symbolToSpec.set(spec.symbol, spec);
  }
}
