import {SymbolDefinitionSpec} from '.';

export class SymbolStore {
  private readonly symbols: SymbolDefinitionSpec[];

  constructor(...symbols: SymbolDefinitionSpec[]) {
    this.symbols = [];

    if (symbols) {
      for (const symbol of symbols) {
        this.symbols.push(symbol);
      }
    }
  }

  public defineSymbol(dimension: string, symbol: string, range: string) {
    const spec: SymbolDefinitionSpec = {dimension, symbol, range};
    this.symbols.push(spec);
  }

  public getSymbolsSpec(): SymbolDefinitionSpec[] {
    return this.symbols;
  }
}
