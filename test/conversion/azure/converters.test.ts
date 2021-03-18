import 'mocha';

import ip from './convert_ip.test';
import nic from './convert_nic.test';
import subnet from './convert_subnet.test';
import vnet from './convert_vnet.test';

export default function test() {
  describe('Converters', () => {
    ip();
    nic();
    subnet();
    vnet();
  });
}
