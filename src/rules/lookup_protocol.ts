import DRange from 'drange';

import { ianaData } from './iaia_data';

function createIanaProtocolLookup() {
  const nameToNumber = new Map<string, number>();
  for (const p of ianaData) {
    const number = Number(p.Decimal);
    const keyword = p.Keyword;
    if (number !== NaN && keyword) {
      nameToNumber.set(keyword, number);
    }
  }

  return (name: string) => {
    const number = nameToNumber.get(name);
    if (number === undefined) {
      const message = `Unknown protocol "${name}".`;
      throw new TypeError(message);
    }
    return number;
  }
}

function createProtocolMap() {
  const nameToRange = new Map<string, DRange>();
  for (const p of ianaData) {
    const number = Number(p.Decimal);
    const keyword = p.Keyword;
    if (number !== NaN && keyword) {
      nameToRange.set(keyword, new DRange(number));
    }
  }

  return nameToRange;
}

export const lookupProtocol = createIanaProtocolLookup();
export const protocolMap = createProtocolMap();

