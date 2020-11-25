import DRange from 'drange';
import * as t from 'io-ts';

import {
  createFormatter,
  createIpFormatter,
  createNumberSymbolFormatter,
  createParser,
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

    // Initialize formatter.
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

    // Initialize parser.
    if (spec.parser === 'ip') {
      this.parser = createParser(this, parseIpOrSymbol2);
    } else if (spec.parser === 'default') {
      this.parser = createParser(this, parseNumberOrSymbol2);
    } else {
      const message = `Unknown parser "${spec.parser}".`;
      throw new TypeError(message);
    }

    // Initialize the domain.
    this.domain = new DRange(0, 0xffffffff);
    this.domain = this.parser(spec.domain);

    // Initalize table of symbol definitions.
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

    // Use this.lookup() to evaluate symbol definitions in topological
    // sort order.
    for (const symbol of this.symbolToDefinition.keys()) {
      const range = this.lookup(symbol);
      this.symbolToRange.set(symbol, range);

      // TODO: what if multiple symbols define the same range?
      const rangeText = range.toString().slice(2, -2); // Trim off "[ " and " ]"
      this.rangeToSymbol.set(rangeText, symbol);
    }
  }

  lookup(symbol: string): DRange {
    const existingRange = this.symbolToRange.get(symbol);
    if (existingRange !== undefined) {
      return existingRange;
    }

    const definition = this.symbolToDefinition.get(symbol);
    if (definition === undefined) {
      const message = `Unknown ${this.name} "${symbol}".`;
      throw new TypeError(message);
    }
    if (definition.open) {
      const message = `Cyclic definition for "${symbol}".`;
      throw new TypeError(message);
    }

    definition.open = true;
    const newRange = this.parser(definition.value);
    definition.open = false;

    return newRange;
  }
}
