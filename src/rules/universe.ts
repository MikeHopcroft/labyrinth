import DRange from 'drange/types';
import * as t from 'io-ts';
import { defaultMaxListeners } from 'stream';

import {Dimension, DimensionFormatter, IdGenerator} from '../setops';
import {
  createFormatter,
  createIpFormatter,
  createNumberSymbolFormatter,
} from './formatters';

import {
  // BaseParser,
  BaseParser2,
  createParser2,
  // DimensionParser,
  parseIpOrSymbol2,
  parseNumberOrSymbol2,
  Parser2
} from './parser';


const DimensionTypeSpecType = t.type({
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

const DimensionSpecType = t.type({
  name: t.string,
  // key: t.string,
  type: t.string
});
export type DimensionSpec = t.TypeOf<typeof DimensionSpecType>;

const UniverseSpecType = t.type({
  types: t.array(DimensionTypeSpecType),
  dimensions: t.array(DimensionSpecType)
});
export type UniverseSpec = t.TypeOf<typeof UniverseSpecType>;

export class DimensionType {
  readonly name: string;
  readonly key: string;
  readonly parser: Parser2;
  readonly formatter: DimensionFormatter;
  readonly domain: DRange;
  readonly symbolToDefinition = new Map<string, {value: string, open: boolean}>();
  readonly symbolToRange = new Map<string, DRange>();
  readonly rangeToSymbol = new Map<string, string>();

  constructor(spec: DimensionTypeSpec) {
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
      this.parser = (dimension: Dimension, text: string) => {
        return parseIpOrSymbol2(dimension, this.lookup, text);
      };
    } else if (spec.parser === 'default') {
      this.parser = (dimension: Dimension, text: string) => {
        return parseNumberOrSymbol2(dimension, this.lookup, text);
      };
    } else {
      const message = `Unknown parser "${spec.parser}".`;
      throw new TypeError(message);
    }

    this.domain = new DRange(); // this.parser(this, spec.domain);


    // // const openSymbols = new Set<string>();
    // const lookup = (symbol: string): DRange | undefined => {
    //   const existingRange = this.symbolToRange.get(symbol);
    //   if (existingRange !== undefined) {
    //     return existingRange;
    //   }

    //   const definition = this.symbolToDefinition.get(symbol);
    //   if (definition === undefined) {
    //     const message = `Undefined symbol "${symbol}".`;
    //     throw new TypeError(message);
    //   }
    //   if (definition.open) {
    //   // if (openSymbols.has(symbol)) {
    //     const message = `Cyclic definition for "${symbol}".`;
    //     throw new TypeError(message);
    //   }
    //   definition.open = true;

    //   // openSymbols.add(symbol);
    //   // TODO: parser needs to take DimensionType, not Dimension.
    //   const newRange = this.parser(this, definition.value);
    //   // openSymbols.delete(symbol);
    //   definition.open = false;

    //   return newRange;
    // }

    // const define = (symbol: string): DRange => {
    //   if (this.symbolToRange.has(symbol)) {
    //     const message = `Dimension "${
    //       this.name
    //     }": Attempt to redefine symbol "${
    //       symbol
    //     }".`;
    //     throw new TypeError(message);
    //   }
    //   this.parser
    // }

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

    // Parse the domain.
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
    const newRange = new DRange(); // this.parser(this, definition.value);
    // openSymbols.delete(symbol);
    definition.open = false;

    return newRange;
  }

}

class Universe {
  private readonly dimensions: Dimension[] = [];
  private readonly keyToDimension = new Map<string, Dimension>();
  private readonly idGenerator = new IdGenerator();

  constructor(spec: UniverseSpec) {

  }
}
