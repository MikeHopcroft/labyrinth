import {asRootId, AzureId} from '../azure_id';
import {AzureObjectIndex} from '../azure_object_index';
import {
  AzureNetworkInterface,
  AzureObjectBase,
  AzureObjectType,
  AzureVirtualMachine,
  AzureVirtualMachineScaleSet,
} from '../azure_types';
import {
  asIpConfigSpecId,
  getNetworkConfigRecipe,
  parseAsVMSSNicConfiguration,
} from './vmss_id';

import {createVmssIpSpec} from './vmss_ip';

export function createVmssNetworkIntefaceSpec(
  ref: AzureObjectBase,
  index: AzureObjectIndex
): AzureNetworkInterface {
  const id = ref.id;
  const azureId = parseAsVMSSNicConfiguration(ref);
  const vmssSpec = index.dereference<AzureVirtualMachineScaleSet>(
    asRootId(azureId)
  );
  const vmssNicSpec = getNetworkConfigRecipe(vmssSpec, azureId);
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
        azureId,
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
  vmssId: AzureId,
  vmssSpec: AzureVirtualMachineScaleSet,
  index: AzureObjectIndex
): AzureVirtualMachine {
  const vm: AzureVirtualMachine = {
    id: id,
    name: `${vmssSpec.name}-${vmssId.subResource?.name}`,
    resourceGroup: vmssSpec.resourceGroup,
    type: AzureObjectType.VIRTUAL_MACHINE,
  };

  if (!index.has(vm.id)) {
    index.add(vm);
  }

  return vm;
}
