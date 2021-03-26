import {assert} from 'chai';
import 'mocha';

import {
  isValidVMSSIpConfigId,
  isValidVMSSIpNic,
} from '../../../src/conversion/azure/azure_id';

export default function test() {
  describe('Synthetics', () => {
    it('detection of sythethetic VMSS ip config', () => {
      const input =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/vnet-test-01/providers/microsoft.compute/virtualmachinescalesets/vmss/virtualmachines/0/networkinterfaces/x-test-vpn-vnet-nic01/ipconfigurations/x-test-vpn-vnet-nic01-defaultipconfiguration';

      const result = isValidVMSSIpConfigId(input);
      assert.equal(result, true);
    });

    it('detection of sythethetic VMSS network interface', () => {
      const input =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/vnet-test-01/providers/microsoft.compute/virtualmachinescalesets/vmss/virtualmachines/0/networkinterfaces/x-test-vpn-vnet-nic01';

      const result = isValidVMSSIpNic(input);
      assert.equal(result, true);
    });
  });
}
