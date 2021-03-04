import {string} from 'io-ts';
import {SymbolDefinitionSpec} from '../../graph';
import {throwIfEmptyString} from './exception_helpers';

export const serviceTagDimensionKey = 'ip';

export class SymbolTable {
  private readonly symbolToSpec = new Map<string, SymbolDefinitionSpec>();

  constructor(symbols: SymbolDefinitionSpec[]) {
    for (const spec of symbols) {
      this.addSpec(spec);
    }
  }

  defineSymbol(dimension: string, symbol: string, range: string) {
    throwIfEmptyString(range, 'Range cannot be empty');

    this.addSpec({dimension, symbol, range});
  }

  defineServiceTag(tagName: string, range: string) {
    this.defineSymbol(serviceTagDimensionKey, tagName, range);
  }

  getAllSymbolSpecs(): SymbolDefinitionSpec[] {
    return [...this.symbolToSpec.values()];
  }

  getSymbolSpec(symbolKey: string): SymbolDefinitionSpec {
    const value = this.symbolToSpec.get(symbolKey);

    if (!value) {
      throw new TypeError(`Unable to locate symbol with the key "${symbolKey}`);
    }

    return value;
  }

  private addSpec(spec: SymbolDefinitionSpec) {
    if (this.symbolToSpec.has(spec.symbol)) {
      const message = `Duplicate symbol "${spec.symbol}"`;
      throw new TypeError(message);
    }
    this.symbolToSpec.set(spec.symbol, spec);
  }
}

// TODO: this approach to escaping might generate a collision with another
// symbol that already uses `_`.
// ISSUE: should escaping be done in SymbolTable.defineSymbol() and
// SymbolTable.getSymbolSpec(), or it escaping the resposibility of the
// caller?
export function escapeSymbol(symbol: string) {
  const s1 = symbol.replace(/[,-]/g, '_');
  // const s2 = s1.replace(/-/g, '_');
  return s1;
}
