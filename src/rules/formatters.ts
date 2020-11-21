import DRange from 'drange';
import * as ip from 'ip';

import {numberToProtocol} from '../rules/lookup_protocol';

export function ipFormatter(r: DRange): string {
  return r
    .toString()
    .replace(
      /(\d+)(?:-(\d+))?/g,
      (text: string, start: string, end?: string) => {
        if (end) {
          return formatIpRange(Number(start), Number(end));
        } else {
          return ip.fromLong(Number(start));
        }
      }
    )
    .slice(2, -2); // Trim off "[ " and " ]"
}

// TODO: Lookup ip names
export function formatIpRange(s: number, e: number) {
  if (s === e) {
    return ip.fromLong(s);
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
    // Other ip address range
    return `${ip.fromLong(s)}-${ip.fromLong(e)}`;
  }
}

export function protocolFormatter(r: DRange): string {
  return r
    .toString()
    .replace(/(\d+)/g, (text: string, protocol: string) => {
      return formatProtocol(Number(protocol));
    })
    .slice(2, -2); // Trim off "[ " and " ]"
}

export function formatProtocol(n: number): string {
  const protocol = numberToProtocol.get(n);
  if (protocol) {
    return protocol;
  } else {
    return n.toString();
  }
}

export function portFormatter(r: DRange): string {
  return r.toString().slice(2, -2); // Trim off "[ " and " ]"
}
