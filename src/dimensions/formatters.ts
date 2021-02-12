import DRange from 'drange';
import * as ip from 'ip';

// DRange field formatting function. Has two use cases:
//
// CASE I: Called directly by formatDRange() to lookup a symbol
// for `text` parameter.
//
// CASE II: called by Javascript replace function in the context of a
// regular expression that matches individual numbers and start-end ranges.
export type Formatter = (text: string, start?: string, end?: string) => string;

//
// Creates a DRange formatter, based on a supplied field formatter.
// The field formatter may involve symbol lookup or number format
// conversions (e.g. long to ip address).
//
// Curried version of formatDRange.
//
export function createFormatter(formatter: Formatter) {
  return (r: DRange) => formatDRange(formatter, r);
}

//
// Uncurried DRange formatter used by CreateFormatter.
//
export function formatDRange(formatter: Formatter, r: DRange): string {
  // TODO: consider checking for `*`, `all` here. This would require
  // passing the Dimension to allow for isUniverse.

  const text = r.toString().slice(2, -2); // Trim off "[ " and " ]"
  const symbol = formatter(text);
  if (symbol !== text) {
    // CASE I: the formatter returned a symbol for the entire DRange.
    return symbol;
  }

  // CASE II: run the formatter on each sub-range.
  return text.replace(/(\d+)(?:-(\d+))?/g, formatter);
}

//
// Factory that creates general-purose numeric formatters for DRange
// fields. Will attempt to replace numbers with symbols, where possible.
//
// Formatter semantics:
//
// Intended to be called by Javascript replace function in the context of a
// regular expression that matches individual numbers and start-end ranges.
//
// When `start` is undefined, attempts to find `text` in `rangeToSymbol`.
// Returns value, if found. Otherwise returns undefined.
//
// When `start` is defined, formats either the `start` value of the
// `start-end` range.
//
export function createNumberSymbolFormatter(
  rangeToSymbol: Map<string, string>
): Formatter {
  return (text: string, start?: string, end?: string) => {
    const symbol = rangeToSymbol.get(text);
    if (start === undefined) {
      // CASE I: function is invoked directly by formatDRange(),
      // instead of indirectly by String.replace(). In this case we
      // are checking whether the entire string is in rangeToSymbol.
      // Since the String.replace() API takes a function that returns
      // string, as opposed to string | undefined, we return `text`
      // if there is no match. The caller must check whether the return
      // value is different than the input `text`.
      return symbol || text;
    } else if (symbol) {
      // CASE II: function is invoked by String.replace() and the entire
      // matched field is in rangeToSymbol. This could happen for a
      // single numeric match or a match to a `start-end` range.
      return symbol;
    }

    // If we got this far, we have failed to match a complete field.
    // Look for matches to portions of the field.
    if (end !== undefined) {
      // CASE III: function is invoked by String.replace() and we've
      // matched a `start-end` range. Attempt to format `start` and
      // `end` individually.
      const startText = rangeToSymbol.get(start) || start;
      const endText = rangeToSymbol.get(end) || end;

      return startText + '-' + endText;
    } else {
      // CASE IV: function is invoked by String.replace() and we've
      // matched a single `start` value. No formatting required as
      // `start` is already numeric.
      // NOTE: don't have to consider rangeToSymbol.get(start) here
      // because CASE II would have applied.
      return start;
    }
  };
}

//
// Factory that creates ip address formatters for DRange fields.
// Will attempt to replace numbers with symbols, where possible.
//
// Formatter semantics:
//
// Intended to be called by Javascript replace function in the context of a
// regular expression that matches individual numbers and start-end ranges.
//
// When `start` is undefined, attempts to find `text` in `rangeToSymbol`.
// Returns value, if found. Otherwise returns undefined.
//
// When `start` is defined, formats either the `start` value of the
// `start-end` range.
//
export function createIpFormatter(
  rangeToSymbol: Map<string, string>
): Formatter {
  return (text: string, start?: string, end?: string) => {
    const symbol = rangeToSymbol.get(text);
    if (start === undefined) {
      // CASE I: function is invoked directly by formatDRange(),
      // instead of indirectly by String.replace(). In this case we
      // are checking whether the entire string is in rangeToSymbol.
      // Since the String.replace() API takes a function that returns
      // string, as opposed to string | undefined, we return `text`
      // if there is no match. The caller must check whether the return
      // value is different than the input `text`.
      return symbol || text;
    } else if (symbol) {
      // CASE II: function is invoked by String.replace() and the entire
      // matched field is in rangeToSymbol. This could happen for a
      // single numeric match or a match to a `start-end` range.
      return symbol;
    }

    // If we got this far, we have failed to match a complete field.
    // Look for matches to portions of the field.
    if (end !== undefined) {
      // CASE III: function is invoked by String.replace() and we've
      // matched a `start-end` range. Attempt to format `start` and
      // `end` individually.

      // First, see if the range can be represented as a CIDR block.
      const cidr = tryGetCIDR(Number(start), Number(end));
      if (cidr !== undefined) {
        return cidr;
      }

      // Otherwise, format the `start` and `end` components of the range.
      const startIp = ip.fromLong(Number(start));
      const endIp = ip.fromLong(Number(end));

      const startText = rangeToSymbol.get(start) || startIp;
      const endText = rangeToSymbol.get(end) || endIp;

      return startText + '-' + endText;
    } else {
      // CASE IV: function is invoked by String.replace() and we've
      // matched a single `start` value. No formatting required as
      // `start` is already numeric.
      // NOTE: don't have to consider rangeToSymbol.get(start) here
      // because CASE II would have applied.
      return ip.fromLong(Number(start));
    }
  };
}

//
// If [s,e] represents a CIDR block, returns a string with the corresponding
// CIDR notation. Otherwise returns undefined.
//
export function tryGetCIDR(s: number, e: number): string | undefined {
  if (s === e) {
    // Not a CIDR block
    return undefined;
  }

  let s1 = s;
  let e1 = e;
  let bits = 0;
  for (let n = 0; n < 32; ++n) {
    if ((s1 & 1) === 0 && (e1 & 1) === 1) {
      ++bits;
    } else {
      break;
    }
    s1 >>= 1;
    e1 >>= 1;
  }
  if (bits > 0 && (s1 ^ e1) === 0) {
    // CIDR block
    return `${ip.fromLong(s)}/${32 - bits}`;
  } else {
    // Other ip address range - not a CIDR block
    return undefined;
  }
}
