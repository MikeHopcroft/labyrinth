import DRange from 'drange';

import { Disjunction, Conjunction, DimensionedRange, Dimension } from '../setops';
import { Rule, RuleDimensions } from './types';
import { lookupProtocol } from './lookup_protocol';

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

export function parseIpSet(dimension: DimensionedRange, text: string): Conjunction {
  // Named ip addresses
  // Named ip sets
  // Single ip addresses
  // Address ranges
  // CIDR ranges

  // Parameterized by
  //   Dimension
  //   Range regex
  //   Parser
  //   Lookup function
}

export function parseProtocolSet(dimension: Dimension, text: string): Conjunction {
  const sections = text.split(',');
  if (sections.length === 1) {
    const s = sections[0].trim();
    if (s === '*' || s=== 'any') {
      return Conjunction.create([]);
    }
  }

  const protcols = new DRange();
  for (const s of sections) {
    const match = s.match(/^\s*(\d+)(?:-(\d+))?\s*$/);

    if (match) {
      const start = parseProtocolNumber(match[1]);
      if (match[2] === undefined) {
        protcols.add(start);
      } else {
        const end = parseProtocolNumber(match[2]);

        if (end <= start) {
          const message = `Start protocol ${start} must be less than end protocol ${end}.`;
          throw new TypeError(message);
        }
        protcols.add(start, end);
      }
    } else {
      const name = s.trim();
      if (name === '*' || name === 'any') {
        const message = '"*" and "any" may not be used with any other protocol.';
        throw new TypeError(message);
      }
      const p = lookupProtocol(name);
      protcols.add(p);
    }
  }

  return Conjunction.create([new DimensionedRange(dimension, protcols)]);
}

export function parsePortSet(dimension: Dimension, text: string): Conjunction {
  const sections = text.split(',');
  if (sections.length === 1) {
    const s = sections[0].trim();
    if (s === '*' || s=== 'any') {
      return Conjunction.create([]);
    }
  }

  const ports = new DRange();
  for (const s of sections) {
    const match = s.match(/^\s*(\d+)(?:-(\d+))?\s*$/);

    if (!match) {
      const message = `Expected port number or range, but found "${s}".`;
      throw new TypeError(message);
    }
    const start = parsePort(match[1]);

    if (match[2] === undefined) {
      ports.add(start);
    } else {
      const end = parsePort(match[2]);

      if (end <= start) {
        const message = `Start port ${start} must be less than end port ${end}.`;
        throw new TypeError(message);
      }
      ports.add(start, end);
    }
  }

  return Conjunction.create([new DimensionedRange(dimension, ports)]);
}

export function parsePort(text: string) {
  const port = Number(text);
  if (port === NaN) {
    const message = `Expected port number but found "${text}"`;
    throw new TypeError(message);
  }
  if (port < 0 || port > 65535) {
    const message = `Port ${port} out of range [0,65535].`;
    throw new TypeError(message);
  }
  if (!Number.isInteger(port)) {
    const message = `Port number ${port} must be an integer.`;
    throw new TypeError(message);
  }
  return port;
}

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