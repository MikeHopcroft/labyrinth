import DRange from 'drange';

import {ianaData} from './iaia_data';

function createProtocolMap() {
  const nameToRange = new Map<string, DRange>();
  for (const p of ianaData) {
    const number = Number(p.Decimal);
    const keyword = p.Keyword;
    if (!Number.isNaN(number) && keyword) {
      nameToRange.set(keyword, new DRange(number));
    }
  }

  return nameToRange;
}

export const protocolMap = createProtocolMap();
