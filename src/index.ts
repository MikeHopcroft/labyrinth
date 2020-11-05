import DRange from 'drange';
import * as ip from 'ip';

function junk() {
  const a = ip.cidrSubnet('128.0.0.1/8');
  console.log(JSON.stringify(a, null, 4));
  console.log(ip.toLong(a.firstAddress));
  console.log(ip.toLong(a.lastAddress));

  const b = new DRange(1, 7);
  const c = new DRange(8, 8);
  console.log(b.intersect(c));

  const all = new DRange(0, 32767);
  function not(x: DRange) {
    return all.subtract(x);
  }

  const empty = new DRange();

  console.log(not(b));
  console.log(empty);
  console.log(not(empty));
  // b.subranges()[0].

  console.log('done');
}

junk();
