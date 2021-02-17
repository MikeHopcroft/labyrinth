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

  public pushHead(dimension: string, symbol: string, range: string) {
    const spec: SymbolDefinitionSpec = {dimension, symbol, range};
    this.symbols.unshift(spec);
  }

  public push(dimension: string, symbol: string, range: string) {
    const spec: SymbolDefinitionSpec = {dimension, symbol, range};
    this.symbols.push(spec);
  }

  public getSymbolsSpec(): SymbolDefinitionSpec[] {
    return this.symbols;
  }
}
