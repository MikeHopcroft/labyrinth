// import DRange from 'drange';

// import {ianaData} from './iaia_data';

// export const protocolToDRange = new Map<string, DRange>();
// export const numberToProtocol = new Map<number, string>();

// function initializeProtocolMaps() {
//   for (const p of ianaData) {
//     const number = Number(p.Decimal);
//     const keyword = p.Keyword;
//     if (!Number.isNaN(number) && keyword) {
//       protocolToDRange.set(keyword, new DRange(number));
//       numberToProtocol.set(number, keyword);
//     }
//   }
// }

// initializeProtocolMaps();

// Code used to generate IANA protocol table in data/dimensions.yaml.
// import * as yaml from 'js-yaml';

// function generateYAML() {
//   const table: Array<{name: string, range: string}> = [];
//   for (const p of ianaData) {
//     const number = Number(p.Decimal);
//     const keyword = p.Keyword;
//     if (!Number.isNaN(number) && keyword && !keyword.includes(' ')) {
//       const name = keyword.trim().replace(/-/g,'_');
//       table.push({name, range: number.toString()})
//       console.log(`  {symbol: '${name}', range: '${number}'},`);
//     }
//   }
//   // console.log(yaml.safeDump(table));
// }

// generateYAML();
