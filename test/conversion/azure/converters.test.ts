import 'mocha';

import ip from './convert_ip.test';
import load_balancer from './convert_load_balancer';
import publicIp from './convert_publicip_test';
import nic from './convert_nic.test';
import resourceGraph from './convert_resource_graph.test';
import subnet from './convert_subnet.test';
import vm from './convert_vm.test';
import vnet from './convert_vnet.test';

export default function test() {
  describe('Converters', () => {
    ip();
    load_balancer();
    nic();
    publicIp();
    resourceGraph();
    subnet();
    vm();
    vnet();
  });
}
