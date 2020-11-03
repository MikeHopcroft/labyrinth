// import * as ip from 'ipaddr.js';

// const [a, n] = ip.parseCIDR('128.0.0.2/8');
// console.log(JSON.stringify(a, null, 4));

// if (a instanceof ip.IPv4) {
//   console.log(a.range());
// }


import DRange from 'drange';
// import DiscontinuousRange from 'discontinuous-range';
import * as ip from 'ip';

const a = ip.cidrSubnet('128.0.0.1/8');
console.log(JSON.stringify(a, null, 4));
console.log(ip.toLong(a.firstAddress));
console.log(ip.toLong(a.lastAddress));

// const b = new DiscontinuousRange(1,10);
// const c = new DiscontinuousRange(9,20);
// console.log(b.subtract(c));
// console.log(b.add(c));

const b = new DRange(1,7);
const c = new DRange(8,8);
console.log(b.intersect(c));

const all = new DRange(0,32767);
function not(x: DRange) {
  return all.subtract(x);
}

const empty = new DRange();

console.log(not(b));
console.log(empty);
console.log(not(empty));
// b.subranges()[0].


console.log('done');

// console.log('Try npm run lint/fix!');

// const longString =
//   'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut aliquet diam.';

// const trailing = 'Semicolon';

// const why = 'am I tabbed?';

// export function doSomeStuff(
//   withThis: string,
//   andThat: string,
//   andThose: string[]
// ) {
//   //function on one line
//   if (!andThose.length) {
//     return false;
//   }
//   console.log(withThis);
//   console.log(andThat);
//   console.dir(andThose);
//   return;
// }
// // TODO: more examples
