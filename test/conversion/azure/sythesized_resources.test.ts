import {assert} from 'chai';
import 'mocha';

import {
  isValidVMSSIpConfigId,
  isValidVMSSIpNic,
} from '../../../src/conversion/azure/azure_id';
import {createVmssNetworkIntefaceSpec} from '../../../src/conversion/azure/convert_vmss';

import {
  createGraphServicesMock,
  subnet1,
  vmss1,
  vmssVm0NicId,
} from './sample_resource_graph';

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

    it('id should be normalized on sythesis', () => {
      const expectedIpConfigId =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/anyresourcegroup/providers/microsoft.compute/virtualmachinescalesets/vmss/virtualmachines/0/networkinterfaces/vmss-default-networkinterfacce/ipconfigurations/vmss-default-ipconfiguration';
      const expectedNicId =
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/anyresourcegroup/providers/microsoft.compute/virtualmachinescalesets/vmss/virtualmachines/0/networkinterfaces/vmss-default-networkinterfacce';

      const {services} = createGraphServicesMock();
      services.index.add(subnet1);
      services.index.add(vmss1);
      const input = vmssVm0NicId;

      const result = createVmssNetworkIntefaceSpec(
        {id: input, resourceGroup: 'test'},
        services.index
      );
      assert.equal(result.id, expectedNicId);
      assert.equal(
        result.properties.ipConfigurations[0].id,
        expectedIpConfigId
      );
    });
  });
}
