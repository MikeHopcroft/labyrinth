import DRange from 'drange';
import * as t from 'io-ts';

import {Dimension, DimensionFormatter} from '../setops';

// TODO: formatters and parsers should probably move to setops.
import {
  createFormatter,
  createIpFormatter,
  createNumberSymbolFormatter,
  createParserNEW,
  parseDRange,
  parseIpOrSymbol2,
  parseNumberOrSymbol2,
  ParseToDRange
} from '../rules';

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

    // TODO: insert real code
    // this.domain = new DRange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    this.domain = new DRange(0, 0xffffffff);
    this.domain = this.parser(spec.domain);

    //////////////////////////////////////////////////////////////////////

    // // TODO: replace simple initialization with one that
    // // allows forward references.
    // for (const {symbol, range} of spec.values) {

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

  lookup(symbol: string): DRange | undefined {
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
    const newRange = new DRange(); // this.parser(this, definition.value);
    // openSymbols.delete(symbol);
    definition.open = false;

    return newRange;
  }
}
