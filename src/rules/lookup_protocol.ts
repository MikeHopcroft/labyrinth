import DRange from 'drange';

import {ianaData} from './iaia_data';

export const protocolToDRange = new Map<string, DRange>();
export const numberToProtocol = new Map<number, string>();

function initializeProtocolMaps() {
  for (const p of ianaData) {
    const number = Number(p.Decimal);
    const keyword = p.Keyword;
    if (!Number.isNaN(number) && keyword) {
      protocolToDRange.set(keyword, new DRange(number));
      numberToProtocol.set(number, keyword);
    }
  }
}

initializeProtocolMaps();
