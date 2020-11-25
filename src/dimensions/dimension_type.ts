console.log('importing dimension_types.ts');

import DRange from 'drange';
import * as t from 'io-ts';

import {
  createFormatter,
  createIpFormatter,
  createNumberSymbolFormatter,
  createParserNEW,
  DimensionFormatter,
  parseIpOrSymbol2,
  parseNumberOrSymbol2,
  ParseToDRange,
} from '../dimensions';

export const DimensionTypeSpecType = t.type({
  name: t.string,
  key: t.string,
  parser: t.string,
  formatter: t.string,
  domain: t.string,
  values: t.array(t.type({
    symbol: t.string,
    range: t.string
  }))
});
export type DimensionTypeSpec = t.TypeOf<typeof DimensionTypeSpecType>;

console.log(`  DimensionTypeSpecType: ${DimensionTypeSpecType}`);

export class DimensionType {
  readonly name: string;
  readonly key: string;
  readonly parser: ParseToDRange;
  readonly formatter: DimensionFormatter;
  readonly domain: DRange;
  readonly symbolToDefinition = new Map<string, {value: string, open: boolean}>();
  readonly symbolToRange = new Map<string, DRange>();
  readonly rangeToSymbol = new Map<string, string>();

  constructor(spec: DimensionTypeSpec) {
    this.lookup = this.lookup.bind(this);

    this.name = spec.name;

    // TODO: disallow `action`, `priority`, etc.
    // Reason is that key will be field name in Rule.
    // Can't clash with Rule.action and Rule.priority.
    this.key = spec.key;

    if (spec.formatter === 'ip') {
      this.formatter = createFormatter(createIpFormatter(this.rangeToSymbol));
    } else if (spec.formatter === 'default') {
      this.formatter = createFormatter(
        createNumberSymbolFormatter(this.rangeToSymbol)
      );
    } else {
      const message = `Unknown formatter "${spec.formatter}".`;
      throw new TypeError(message);
    }

    if (spec.parser === 'ip') {
      this.parser = createParserNEW(this, parseIpOrSymbol2);
      // this.parser = (text: string) => {
      //   return parseIpOrSymbol2(this, this.lookup, text);
      // };
    } else if (spec.parser === 'default') {
      this.parser = createParserNEW(this, parseNumberOrSymbol2);
      // this.parser = (text: string) => {
      //   return parseNumberOrSymbol2(this, this.lookup, text);
      // };
    } else {
      const message = `Unknown parser "${spec.parser}".`;
      throw new TypeError(message);
    }

    this.domain = new DRange(0, 0xffffffff);
    this.domain = this.parser(spec.domain);

    for (const {symbol, range} of spec.values) {
      ///////////////////////////////////////////////////////////////////
      // TODO: Disallow `*`, `any`
      // What about numbers and ip addresses?
      // Should at least unit test behavior.
      // Also unit test cycle detection and symbol chain.
      ///////////////////////////////////////////////////////////////////
      if (this.symbolToDefinition.has(symbol)) {
        const message = `Dimension "${
          this.name
        }": Attempt to redefine symbol "${
          symbol
        }".`;
        throw new TypeError(message);
      }
      this.symbolToDefinition.set(
        symbol,
        {
          value: range,
          open: false,
        }
      )
    }

    for (const symbol of this.symbolToDefinition.keys()) {
      const range = this.lookup(symbol);
      this.symbolToRange.set(symbol, range);

      // TODO: what if multiple symbols define the same range?
      const rangeText = range.toString().slice(2, -2); // Trim off "[ " and " ]"
      this.rangeToSymbol.set(rangeText, symbol);
    }

    //   // Disallow `*`, `any`

    //   // TODO: move this check into lookup.
    //   // Skip symbols that are already defined.
    //   if (this.symbolToRange.has(symbol)) {
    //     const message = `Dimension "${
    //       this.name
    //     }": Attempt to redefine symbol "${
    //       symbol
    //     }".`;
    //     throw new TypeError(message);
    //   }

    //   // Parse the range.
      
    //   // Create entries in symbolToRange and rangeToSymbol.
    //   // const r = this.parser
    // }
  }

  lookup(symbol: string): DRange {
    const existingRange = this.symbolToRange.get(symbol);
    if (existingRange !== undefined) {
      return existingRange;
    }

    const definition = this.symbolToDefinition.get(symbol);
    if (definition === undefined) {
      const message = `Undefined symbol "${symbol}".`;
      throw new TypeError(message);
    }
    if (definition.open) {
    // if (openSymbols.has(symbol)) {
      const message = `Cyclic definition for "${symbol}".`;
      throw new TypeError(message);
    }
    definition.open = true;

    // openSymbols.add(symbol);
    // TODO: parser needs to take DimensionType, not Dimension.
    // TODO: insert real code.
    const newRange = this.parser(definition.value);
    // openSymbols.delete(symbol);
    definition.open = false;

    return newRange;
  }
}
