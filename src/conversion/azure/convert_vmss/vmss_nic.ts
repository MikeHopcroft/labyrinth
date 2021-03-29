import {
  asIpConfigSpecId,
  AzureVMSSIpResult,
  getIpConfigWithNic,
  parseAsVMSSNicConfiguration,
} from '../azure_id';
import {AzureObjectIndex} from '../azure_object_index';
import {
  AzureNetworkInterface,
  AzureObjectBase,
  AzureObjectType,
  AzureVirtualMachine,
  AzureVirtualMachineScaleSet,
} from '../azure_types';

import {createVmssIpSpec} from './vmss_ip';

export function createVmssNetworkIntefaceSpec(
  ref: AzureObjectBase,
  index: AzureObjectIndex
): AzureNetworkInterface {
  const id = ref.id.toLowerCase();
  const vmssId = parseAsVMSSNicConfiguration(ref);
  const vmssSpec = index.dereference<AzureVirtualMachineScaleSet>(
    vmssId.vmssId
  );
  const vmssNicSpec = getIpConfigWithNic(vmssId, vmssSpec, true).nicSpec;
  const ipConfigurations = [
    ...vmssNicSpec.properties.ipConfigurations.map(x =>
      createVmssIpSpec(asIpConfigSpecId(ref, x), index)
    ),
  ];

  const nic: AzureNetworkInterface = {
    id,
    type: AzureObjectType.NIC,
    name: vmssNicSpec.name,
    resourceGroup: vmssSpec.resourceGroup,
    properties: {
      networkSecurityGroup: vmssNicSpec.properties.networkSecurityGroup,
      ipConfigurations,
      virtualMachine: createVmssVmSepc(
        index.getParentId({id, resourceGroup: ''}).id,
        vmssId,
        vmssSpec,
        index
      ),
    },
  };

  if (!index.has(nic.id)) {
    index.add(nic);
    index.addReference(nic, ipConfigurations[0].properties.subnet);
  }

  return nic;
}

export function createVmssVmSepc(
  id: string,
  vmssId: AzureVMSSIpResult,
  vmssSpec: AzureVirtualMachineScaleSet,
  index: AzureObjectIndex
): AzureVirtualMachine {
  const vm: AzureVirtualMachine = {
    id: id,
    name: `${vmssSpec.name}-${vmssId.logicalId}`,
    resourceGroup: vmssSpec.resourceGroup,
    type: AzureObjectType.VIRTUAL_MACHINE,
  };

  if (!index.has(vm.id)) {
    index.add(vm);
  }

  return vm;
}
