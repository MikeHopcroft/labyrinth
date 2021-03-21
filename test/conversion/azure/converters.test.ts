import 'mocha';

import ip from './convert_ip.test';
import load_balancer from './convert_load_balancer';
import nic from './convert_nic.test';
import subnet from './convert_subnet.test';
import vm from './convert_vm.test';
import vnet from './convert_vnet.test';

export default function test() {
  describe('Converters', () => {
    ip();
    load_balancer();
    nic();
    subnet();
    vm();
    vnet();
  });
}
