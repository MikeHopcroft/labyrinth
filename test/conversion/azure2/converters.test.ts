import 'mocha';

import ip from './convert_ip.test';
import vnet from './convert_vnet.test';

export default function test() {
  describe('Converters', () => {
    ip();
    vnet();
  });
}

