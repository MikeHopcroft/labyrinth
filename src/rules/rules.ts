import DRange from 'drange';
import * as ip from 'ip';

import { Disjunction, Conjunction, DimensionedRange, Dimension } from '../setops';
import { Rule, RuleDimensions } from './types';
import { lookupProtocol, protocolMap } from './lookup_protocol';
import { number } from 'io-ts';

interface RuleGroup {
  allow: Rule[],
  deny: Rule[]
}

// function build(dimensions: RuleDimensions, rules: Rule[]): Disjunction {
//   // Sort and group rules by priority ascending
//   // Split each group into allow and deny
//   const groups: RuleGroup[] = [];

//   // Default first rule allows all.
//   // Should this deny all instead?
//   let expression: Disjunction = Disjunction.create([Conjunction.create([])]);

//   for (const g of groups) {
//     for (const r of g.allow) {
//       const e = Disjunction.create([buildOneRule(dimensions, r)]);
//       // TODO: convenience method to intersect Disjunction with Conjunction.
//       expression = expression.union(e);
//     }

//     // TODO: REVIEW: not sure this is correct.
//     // Do we need to apply De Morgan to the entire conjunction?
//     for (const r of g.deny) {
//       const e = buildOneRule(dimensions, r).complement();
//       expression = expression.intersect(e);
//     }
//   }

//   return expression;
// }

// function buildOneRule(dimensions: RuleDimensions, rule: Rule): Conjunction {
//   const factors: DimensionedRange[] = [];

//   if (rule.destIp) {
//     const r = createRange(rule.destIp)
//     factors.push(new DimensionedRange(dimensions.destIp, r))
//   }

//   return Conjunction.create(factors);
// }

function tryParseIp(factors: DimensionedRange[], d: Dimension, text?: string) {
  if (text) {
    // split text on commas
    // case 1: single ip address: a
    // case 2: ip CIDR range: a/b
    // case 3: ip address range: a-b

    // Build up drange
    // Create DimensionedRange
    // Push on to factors.
  }
}

function tryParsePort(factors: DimensionedRange[], d: Dimension, text?: string) {
  // split text on commas
  // case 1: single port: a
  // case 2: port range: a-b
}

function tryParseProtocol(factors: DimensionedRange[], d: Dimension, text?: string) {
  // a(, b)*
}

// export function parseIpSet(dimension: DimensionedRange, text: string): Conjunction {
//   // Named ip addresses
//   // Named ip sets
//   // Single ip addresses
//   // Address ranges
//   // CIDR ranges

//   // Parameterized by
//   //   Dimension
//   //   Range regex
//   //   Parser
//   //   Lookup function
// }

export function parseSet(
  name: string,
  dimension: Dimension,
  parse: (name: string, dimension: Dimension, text: string) => DRange,
  text: string
): Conjunction {
  const sections = text.split(',');
  if (sections.length === 1) {
    const s = sections[0].trim();
    if (s === '*' || s === 'any') {
      return Conjunction.create([]);
    }
  }

  const range = new DRange();
  for (const s of sections) {
    // const match = s.match(/^\s*(\d+)(?:-(\d+))?\s*$/);
    const match = s.match(/^\s*([^-\s]+)(?:-([^-\s]+))?\s*$/);

    if (match) {
      // TODO: rework this clause to handle identifiers, "any", and "*" here.
      // CASE: start-end
      const start = parse(name, dimension, match[1]);
      if (match[2] === undefined) {
        range.add(start);
      } else {
        const end = parse(name, dimension, match[2]);

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
          const message = `Start ${name} ${
            match[1]
            } must be less than end ${name} ${
            match[2]
            }.`;
          throw new TypeError(message);
        }
        range.add(startValue, endValue);
      }
    } else {
      // CASE: value
      const identifier = s.trim();
      if (identifier === '*' || identifier === 'any') {
        const message = `"*" and "any" may not be used with any other ${name}.`;
        throw new TypeError(message);
      }
      const value = parse(name, dimension, identifier);
      range.add(value);
    }
  }

  return Conjunction.create([new DimensionedRange(dimension, range)]);
}

export function parseIpSet(dimension: Dimension, text: string): Conjunction {
  // TODO: add symbolic IPs
  // const parser = (name: string, dimension: Dimension, text: string) => {
  //   return parseNumberOrSymbol(
  //     name,
  //     dimension,
  //     protocolMap,
  //     text
  //   );
  // };
  return parseSet('protocol', dimension, parseIp, text);
}

export function parseProtocolSet(dimension: Dimension, text: string): Conjunction {
  const parser = (name: string, dimension: Dimension, text: string) => {
    return parseNumberOrSymbol(
      name,
      dimension,
      protocolMap,
      text
    );
  };
  return parseSet('protocol', dimension, parser, text);
}

// export function parseProtocolSet2(dimension: Dimension, text: string): Conjunction {
//   const sections = text.split(',');
//   if (sections.length === 1) {
//     const s = sections[0].trim();
//     if (s === '*' || s=== 'any') {
//       return Conjunction.create([]);
//     }
//   }

//   const protcols = new DRange();
//   for (const s of sections) {
//     const match = s.match(/^\s*(\d+)(?:-(\d+))?\s*$/);

//     if (match) {
//       const start = parseProtocolNumber(match[1]);
//       if (match[2] === undefined) {
//         protcols.add(start);
//       } else {
//         const end = parseProtocolNumber(match[2]);

//         if (end <= start) {
//           const message = `Start protocol ${start} must be less than end protocol ${end}.`;
//           throw new TypeError(message);
//         }
//         protcols.add(start, end);
//       }
//     } else {
//       const name = s.trim();
//       if (name === '*' || name === 'any') {
//         const message = '"*" and "any" may not be used with any other protocol.';
//         throw new TypeError(message);
//       }
//       const p = lookupProtocol(name);
//       protcols.add(p);
//     }
//   }

//   return Conjunction.create([new DimensionedRange(dimension, protcols)]);
// }

export function parsePortSet(dimension: Dimension, text: string): Conjunction {
  return parseSet('port', dimension, parseNumber, text);
}

// export function parsePortSet2(dimension: Dimension, text: string): Conjunction {
//   const sections = text.split(',');
//   if (sections.length === 1) {
//     const s = sections[0].trim();
//     if (s === '*' || s=== 'any') {
//       return Conjunction.create([]);
//     }
//   }

//   const ports = new DRange();
//   for (const s of sections) {
//     const match = s.match(/^\s*(\d+)(?:-(\d+))?\s*$/);

//     if (!match) {
//       const message = `Expected port number or range, but found "${s}".`;
//       throw new TypeError(message);
//     }
//     const start = parsePort(match[1]);

//     if (match[2] === undefined) {
//       ports.add(start);
//     } else {
//       const end = parsePort(match[2]);

//       if (end <= start) {
//         const message = `Start port ${start} must be less than end port ${end}.`;
//         throw new TypeError(message);
//       }
//       ports.add(start, end);
//     }
//   }

//   return Conjunction.create([new DimensionedRange(dimension, ports)]);
// }

// export function parsePort(text: string) {
//   const port = Number(text);
//   if (port === NaN) {
//     const message = `Expected port number but found "${text}"`;
//     throw new TypeError(message);
//   }
//   if (port < 0 || port > 65535) {
//     const message = `Port ${port} out of range [0,65535].`;
//     throw new TypeError(message);
//   }
//   if (!Number.isInteger(port)) {
//     const message = `Port number ${port} must be an integer.`;
//     throw new TypeError(message);
//   }
//   return port;
// }

export function parseProtocolNumber(text: string) {
  const protocol = Number(text);
  if (protocol === NaN) {
    const message = `Expected protocol number but found "${text}"`;
    throw new TypeError(message);
  }
  if (protocol < 0 || protocol > 255) {
    const message = `Protocol ${protocol} out of range [0,255].`;
    throw new TypeError(message);
  }
  if (!Number.isInteger(protocol)) {
    const message = `Protocol number ${protocol} must be an integer.`;
    throw new TypeError(message);
  }
  return protocol;
}

export function parseNumberOrSymbol(
  name: string,  // TODO: get name from dimension
  dimension: Dimension,
  lookup: Map<string, DRange>,
  text: string
) {
  if (!Number.isNaN(Number(text))) {
    return parseNumber(name, dimension, text);
  } else {
    return parseSymbol(name, dimension, lookup, text);
  }
}

// export function parseNumber(
//   name: string,  // TODO: get name from dimension
//   dimension: Dimension,
//   text: string
// ): DRange {
//   return validateNumber(name, dimension, text);
// }

export function parseIp(
  name: string,  // TODO: get name from dimension
  dimension: Dimension,
  text: string
): DRange {
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

export function parseNumber(
  name: string,  // TODO: get name from dimension
  dimension: Dimension,
  text: string
): DRange {
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

export function parseSymbol(
  name: string,  // TODO: get name from dimension
  dimension: Dimension,
  lookup: Map<string, DRange>,
  text: string
): DRange {
  const value = lookup.get(text.trim());
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
    const message = `${
      capitalize(name)
      } "${
      text.trim()
      }" out of range [${dStart},${dEnd}].`;
    throw new TypeError(message);
  }

  return value;
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.substr(1);
}
