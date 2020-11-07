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

export const lookupProtocol = createIanaProtocolLookup();
