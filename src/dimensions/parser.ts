import DRange from 'drange';
import * as ip from 'ip';

import {Dimension, DimensionType} from '.';

import {
  Conjunction,
  DimensionedRange,
} from '../setops';

type Parser = (dimension: Dimension, text: string) => Conjunction;
export type ParseToDRange = (text: string) => DRange;

type SymbolToDRange = (symbol: string) => DRange | undefined;
export type BaseParser2 = (
  dimension: DimensionType,
  lookup: SymbolToDRange,
  text: string
) => DRange;
function symbolToUndefined(symbol: string) {
  return undefined;
}

function parseSet(
  dimension: Dimension,
  parse: (dimension: DimensionType, text: string) => DRange,
  text: string
): Conjunction {
  const range = parseDRange(dimension.type, parse, text);
  return Conjunction.create([new DimensionedRange(dimension, range)]);
}

export function parseDRange(
  dimension: DimensionType,
  parse: (dimension: DimensionType, text: string) => DRange,
  text: string
): DRange {
  const name = dimension.name;

  const sections = text.split(',');
  if (sections.length === 1) {
    const s = sections[0].trim();
    if (s === '*' || s === 'any') {
      return dimension.domain;
    }
  }

  const range = new DRange();
  for (const s of sections) {
    const match = s.match(/^\s*([^-\s]+)(?:-([^-\s]+))?\s*$/);

    if (match) {
      if (match[1] === 'any' || match[1] === '*') {
        const message = `"*" and "any" may not be used with any other ${name}.`;
        throw new TypeError(message);
      }

      const start = parse(dimension, match[1]);
      if (match[2] === undefined) {
        range.add(start);
      } else {
        if (match[2] === 'any' || match[2] === '*') {
          const message = `"*" and "any" may not be used with any other ${name}.`;
          throw new TypeError(message);
        }

        const end = parse(dimension, match[2]);
        if (start.length !== 1) {
          const message = `Start of range "${match[1]}" must resolve to a single ${name}.`;
          throw new TypeError(message);
        }
        if (end.length !== 1) {
          const message = `End of range "${match[2]}" must resolve to a single ${name}.`;
          throw new TypeError(message);
        }

        const startValue = start.numbers()[0];
        const endValue = end.numbers()[0];
        if (endValue <= startValue) {
          const message = `Start ${name} ${match[1]} must be less than end ${name} ${match[2]}.`;
          throw new TypeError(message);
        }
        range.add(startValue, endValue);
      }
    } else {
      const message = `Invalid ${name} "${s}".`;
      throw new TypeError(message);
    }
  }

  return range;
}

///////////////////////////////////////////////////////////////////////////////
//
//
//
///////////////////////////////////////////////////////////////////////////////


export function createParserDEPRECATED(
  baseParser: BaseParser2,
  lookup: SymbolToDRange
): Parser {
  const parser = (dimension: DimensionType, text: string) => {
    return baseParser(dimension, lookup, text);
  };

  return (dimension: Dimension, text: string) =>
    parseSet(dimension, parser, text);
}

export function createParserNEW(
  type: DimensionType,
  baseParser: BaseParser2,
): ParseToDRange {
  const parser = (type: DimensionType, text: string) => {
    return baseParser(type, type.lookup, text);
  };

  return (text: string) =>
    parseDRange(type, parser, text);
}

export function parseIpOrSymbol2(
  dimension: DimensionType,
  lookup: SymbolToDRange,
  text: string
): DRange {
  text = text.trim();
  if (text[0] !== undefined && text[0] >= '0' && text[0] <= '9') {
    return parseIp(dimension, text);
  } else {
    return parseSymbol2(dimension, lookup, text);
  }
}

export function parseNumberOrSymbol2(
  dimension: DimensionType,
  lookup: SymbolToDRange,
  text: string
): DRange {
  if (!Number.isNaN(Number(text))) {
    return parseNumber(dimension, text);
  } else {
    return parseSymbol2(dimension, lookup, text);
  }
}

export function parseIp(dimension: DimensionType, text: string): DRange {
  const trimmed = text.trim();
  const parts = trimmed.split('/');

  if (!ip.isV4Format(parts[0])) {
    const message = `Invalid IPv4 address: "${parts[0]}".`;
    throw new TypeError(message);
  }

  if (parts.length === 2) {
    // This could be an IPv4 CIDR
    try {
      const cidr = ip.cidrSubnet(trimmed);

      // TODO: REVIEW: do we want to use
      //   cidr.networkAddress
      //   cidr.firstAddress?
      const start = ip.toLong(cidr.networkAddress);

      // TODO: REVIEW: do we want to use
      //   cidr.lastAddress
      //   cidr.firstAddress + cidr.length - 1
      //   cidr.networkAddress + cidr.length - 1
      const end = start + cidr.length - 1;
      return new DRange(start, end);
    } catch (e) {
      const message = `Invalid IPv4 CIDR: "${trimmed}".`;
      throw new TypeError(message);
    }
  } else {
    // This is an IPv4 address
    const value = ip.toLong(trimmed);
    return new DRange(value);
  }
}

export function parseNumber(dimension: DimensionType, text: string): DRange {
  const name = dimension.name;
  const value = Number(text);
  if (Number.isNaN(value)) {
    const message = `Expected ${name} number but found "${text}".`;
    throw new TypeError(message);
  }
  if (!Number.isInteger(value)) {
    const message = `${capitalize(name)} number ${value} must be an integer.`;
    throw new TypeError(message);
  }

  const domain = dimension.domain;
  const start = domain.index(0);
  const end = domain.index(domain.length - 1);
  if (value < start || value > end) {
    const message = `Invalid ${name} number ${value} out of range [${start},${end}].`;
    throw new TypeError(message);
  }

  return new DRange(value);
}

export function parseSymbol2(
  dimension: DimensionType,
  lookup: SymbolToDRange,
  text: string
): DRange {
  const name = dimension.name;
  const value = lookup(text.trim());
  if (value === undefined) {
    const message = `Unknown ${name} "${text}".`;
    throw new TypeError(message);
  }

  const domain = dimension.domain;
  const dStart = domain.index(0);
  const dEnd = domain.index(domain.length - 1);
  const vStart = value.index(0);
  const vEnd = value.index(value.length - 1);
  if (vStart < dStart || vStart > dEnd || vEnd < dStart || vEnd > dEnd) {
    const message = `${capitalize(
      name
    )} "${text.trim()}" out of range [${dStart},${dEnd}].`;
    throw new TypeError(message);
  }

  return value;
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.substr(1);
}
