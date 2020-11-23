import DRange from 'drange';
import * as ip from 'ip';

// import {numberToProtocol} from '../rules/lookup_protocol';

type Formatter = (text: string, start?: string, end?: string) => string;

export function createFormatter(formatter: Formatter) {
  return (r: DRange) => generalFormatter(formatter, r);
}

export function generalFormatter(formatter: Formatter, r: DRange): string {
  const text = r.toString().slice(2, -2); // Trim off "[ " and " ]"
  const symbol = formatter(text);
  if (symbol !== text) {
    return symbol;
  }

  return text.replace(/(\d+)(?:-(\d+))?/g, formatter);
}

export function createGenericFormatter(
  rangeToSymbol: Map<string, string>
): Formatter {
  return (text: string, start?: string, end?: string) => {
    const symbol = rangeToSymbol.get(text);
    if (start === undefined) {
      return symbol || text;
    } else if (symbol) {
      return symbol;
    }

    if (end !== undefined) {
      const startText = rangeToSymbol.get(start) || start;
      const endText = rangeToSymbol.get(end) || end;

      return startText + '-' + endText;
      // return rangeToSymbol.get(rangeText) || rangeText;
    } else {
      return rangeToSymbol.get(start) || start;
    }
  };
}

export function createIpFormatter(
  rangeToSymbol: Map<string, string>
): Formatter {
  return (text: string, start?: string, end?: string) => {
    // if (start === undefined) {
    //   return rangeToSymbol.get(text) || text;
    // }

    // console.log(`text: "${text}", start: "${start}", end: "${end}"`);

    const symbol = rangeToSymbol.get(text);
    if (start === undefined) {
      return symbol || text;
    } else if (symbol) {
      return symbol;
    }

    if (end !== undefined) {
      const cidr = tryGetCIDR(Number(start), Number(end));
      if (cidr !== undefined) {
        // return rangeToSymbol.get(cidr) || cidr;
        return cidr;
      }

      const startIp = ip.fromLong(Number(start));
      const endIp = ip.fromLong(Number(end));

      // return startIp + '-' + endIp;
      const startText = rangeToSymbol.get(start) || startIp;
      const endText = rangeToSymbol.get(end) || endIp;

      const rangeText = startText + '-' + endText;
      return rangeText;
      // return rangeToSymbol.get(rangeText) || rangeText;
    } else {
      // return ip.fromLong(Number(start));

      // NOTE: function would have returned earlier
      // if rangeToSymbol.get(start) would return a value.
      const startIp = ip.fromLong(Number(start));
      const startText = rangeToSymbol.get(start) || startIp;
      return startText;
    }
  };
}

function tryGetCIDR(s: number, e: number): string | undefined {
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
  if (bits > 0) {
    // CIDR block
    return `${ip.fromLong(s)}/${32 - bits}`;
  } else {
    // Other ip address range - not a CIDR block
    return undefined;
  }
}

// export function ipFormatter(r: DRange): string {
//   return r
//     .toString()
//     .replace(
//       /(\d+)(?:-(\d+))?/g,
//       (text: string, start: string, end?: string) => {
//         if (end) {
//           return formatIpRange(Number(start), Number(end));
//         } else {
//           return ip.fromLong(Number(start));
//         }
//       }
//     )
//     .slice(2, -2); // Trim off "[ " and " ]"
// }

// // TODO: Lookup ip names
// export function formatIpRange(s: number, e: number) {
//   if (s === e) {
//     return ip.fromLong(s);
//   }

//   let s1 = s;
//   let e1 = e;
//   let bits = 0;
//   for (let n = 0; n < 32; ++n) {
//     if ((s1 & 1) === 0 && (e1 & 1) === 1) {
//       ++bits;
//     } else {
//       break;
//     }
//     s1 >>= 1;
//     e1 >>= 1;
//   }
//   if (bits > 0) {
//     // CIDR block
//     return `${ip.fromLong(s)}/${32 - bits}`;
//   } else {
//     // Other ip address range
//     return `${ip.fromLong(s)}-${ip.fromLong(e)}`;
//   }
// }

// export function protocolFormatter(r: DRange): string {
//   return r
//     .toString()
//     .replace(/(\d+)/g, (text: string, protocol: string) => {
//       return formatProtocol(Number(protocol));
//     })
//     .slice(2, -2); // Trim off "[ " and " ]"
// }

// export function formatProtocol(n: number): string {
//   const protocol = numberToProtocol.get(n);
//   if (protocol) {
//     return protocol;
//   } else {
//     return n.toString();
//   }
// }

// export function portFormatter(r: DRange): string {
//   return r.toString().slice(2, -2); // Trim off "[ " and " ]"
// }
