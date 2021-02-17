import DRange from 'drange';
import * as t from 'io-ts';

import {isValidIdentifier} from '../utilities';

import {DimensionFormatter} from './dimension';

import {
  createFormatter,
  createIpFormatter,
  createNumberSymbolFormatter,
} from './formatters';

import {
  createParser,
  parseIpOrSymbol,
  parseNumberOrSymbol,
  ParseToDRange,
} from './parsers';

export const codecDimensionTypeSpec = t.type({
  name: t.string,
  key: t.string,
  parser: t.string,
  formatter: t.string,
  domain: t.string,
  values: t.array(
    t.type({
      symbol: t.string,
      range: t.string,
    })
  ),
});
export type DimensionTypeSpec = t.TypeOf<typeof codecDimensionTypeSpec>;

export class DimensionType {
  readonly name: string;
  readonly key: string;
  readonly parser: ParseToDRange;
  readonly formatter: DimensionFormatter;
  readonly domain: DRange;
  readonly symbolToDefinition = new Map<
    string,
    {value: string; open: boolean}
  >();
  readonly symbolToRange = new Map<string, DRange>();
  readonly rangeToSymbol = new Map<string, string>();

  static readonly reservedWords = new Set<string>(['all', '*']);

  constructor(spec: DimensionTypeSpec, reservedWords?: Set<string>) {
    this.lookup = this.lookup.bind(this);

    this.name = spec.name;

    // TODO: disallow `action`, `priority`, etc.
    // Reason is that key will be field name in Rule.
    // Can't clash with Rule.action and Rule.priority.
    if (!isValidIdentifier(spec.key)) {
      const message = `Dimension "${this.name}": illegal Javascript identifier "${spec.key}".`;
      throw new TypeError(message);
    }

    if (reservedWords && reservedWords.has(spec.key)) {
      const message = `Dimension "${this.name}": reserved keyword "${
        spec.key
      }". Cannot use ${[...reservedWords.values()]}.`;
      throw new TypeError(message);
    }

    this.key = spec.key;

    // Initialize formatter.
    if (spec.formatter === 'ip') {
      this.formatter = createFormatter(createIpFormatter(this.rangeToSymbol));
    } else if (spec.formatter === 'default') {
      this.formatter = createFormatter(
        createNumberSymbolFormatter(this.rangeToSymbol)
      );
    } else {
      const message = `Dimension "${this.name}": unknown formatter "${spec.formatter}".`;
      throw new TypeError(message);
    }

    // Initialize parser.
    if (spec.parser === 'ip') {
      this.parser = createParser(this, parseIpOrSymbol);
    } else if (spec.parser === 'default') {
      this.parser = createParser(this, parseNumberOrSymbol);
    } else {
      const message = `Dimension "${this.name}": unknown parser "${spec.parser}".`;
      throw new TypeError(message);
    }

    // Initialize the domain.
    this.domain = new DRange(0, 0xffffffff);
    this.domain = this.parser(spec.domain);

    // Initalize table of symbol definitions.
    for (const {symbol, range} of spec.values) {
      this.defineSymbol(symbol, range);
    }

    // DESIGN NOTE: symbols are actually indexed in topological sort order
    // because this.indexSymbol() calls this.lookup() which calls this.parser()
    // which calls parseDRange() which recursively invokves this.parser().
    // The topological sort order allows us to define each symbol at its first
    // use. This is important for symbol reference chains, e.g. the definitions
    //   a = b
    //   b = c
    //   c = 1
    // result in
    //   a = 1
    //   b = 1
    //   c = 1
    //
    for (const symbol of this.symbolToDefinition.keys()) {
      this.indexSymbol(symbol);
    }
  }

  indexSymbol(symbol: string) {
    const range = this.lookup(symbol);
    this.symbolToRange.set(symbol, range);

    // TODO: what if multiple symbols define the same range?
    const rangeText = range.toString().slice(2, -2); // Trim off "[ " and " ]"
    this.rangeToSymbol.set(rangeText, symbol);
  }

  defineSymbol(symbol: string, value: string) {
    ///////////////////////////////////////////////////////////////////
    // TODO: Disallow `*`, `any`, `-`, `,`
    // What about numbers and ip addresses?
    // Should at least unit test behavior.
    // Also unit test cycle detection and symbol chain.
    ///////////////////////////////////////////////////////////////////
    if (!this.isValidSymbol(symbol)) {
      const message = `Dimension "${this.name}": illegal symbol "${symbol}".`;
      throw new TypeError(message);
    }
    if (this.symbolToDefinition.has(symbol)) {
      const message = `Dimension "${this.name}": attempt to redefine symbol "${symbol}".`;
      throw new TypeError(message);
    }
    this.symbolToDefinition.set(symbol, {
      value,
      open: false,
    });
  }

  isValidSymbol(text: string): boolean {
    if (text.match(/[-,]/)) {
      return false;
    }

    return !DimensionType.reservedWords.has(text);
  }

  lookup(symbol: string): DRange {
    const existingRange = this.symbolToRange.get(symbol);
    if (existingRange !== undefined) {
      return existingRange;
    }

    const definition = this.symbolToDefinition.get(symbol);
    if (definition === undefined) {
      const message = `Dimension "${this.name}": unknown ${this.name} "${symbol}".`;
      throw new TypeError(message);
    }
    if (definition.open) {
      const message = `Dimension "${this.name}": cyclic definition for "${symbol}".`;
      throw new TypeError(message);
    }

    definition.open = true;
    const newRange = this.parser(definition.value);
    definition.open = false;

    return newRange;
  }
}
