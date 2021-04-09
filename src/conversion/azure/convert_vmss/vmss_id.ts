import {asRootId, AzureId, parseAzureId} from '../azure_id';
import {
  AzureObjectBase,
  AzureVirtualMachineScaleSet,
  AzureVmssIpConfiguration,
  AzureVmssNetworkInterfaceConfig,
} from '../azure_types';

enum ResourceTypes {
  IpConfigurations = 'ipconfigurations',
  NetworkInterfaces = 'networkinterfaces',
  VirtualMachines = 'virtualmachines',
  VirtualMachineScaleSet = 'virtualmachinescalesets',
}

export function isValidVMSSIpConfigId(id: AzureId): boolean {
  return (
    id.type === ResourceTypes.VirtualMachineScaleSet &&
    id.subResource3?.type === ResourceTypes.IpConfigurations
  );
}

export function isValidVMSSIpNic(id: AzureId): boolean {
  return (
    id.type === ResourceTypes.VirtualMachineScaleSet &&
    id.subResource2?.type === ResourceTypes.NetworkInterfaces
  );
}

export function asNicConfigSpecId(input: AzureId) {
  return [
    asRootId(input).id,
    input.subResource!.type,
    input.subResource!.name,
    input.subResource2!.type,
    input.subResource2!.name,
  ].join('/');
}

export function asIpConfigSpecId(
  ref: AzureObjectBase,
  ipConfig: AzureVmssIpConfiguration
): AzureObjectBase {
  return {
    id: `${ref.id}/${ResourceTypes.IpConfigurations}/${ipConfig.name}`,
    resourceGroup: ref.resourceGroup,
  };
}

export function parseAsVMSSIpConfiguration(ref: AzureObjectBase): AzureId {
  const azureId = parseAzureId(ref);
  if (!isValidVMSSIpConfigId(azureId)) {
    throw new TypeError(`Invalid VMSS IP Configuration Id '${ref.id}'`);
  }
  return azureId;
}

// In the case of Load Balancers which are using VMSS there are references which
// do not contain direct items in the graph. This parsing function extracts the
// separates the id which then can be used to look up necessary downstream items
export function parseAsVMSSNicConfiguration(ref: AzureObjectBase): AzureId {
  const azureId = parseAzureId(ref);
  if (!isValidVMSSIpNic(azureId)) {
    throw new TypeError(`Invalid VMSS NIC Configuration Id '${ref.id}'`);
  }
  return azureId;
}

export function getNetworkConfigRecipe(
  vmssSpec: AzureVirtualMachineScaleSet,
  azureId: AzureId
): AzureVmssNetworkInterfaceConfig {
  const networkConfig = vmssSpec.properties.virtualMachineProfile.networkProfile.networkInterfaceConfigurations.find(
    input => input.name === azureId.subResource2!.name
  );

  if (!networkConfig) {
    throw new TypeError(
      `Incomplete graph. Unable to locate VMSS '${
        vmssSpec.id
      }' with interface config '${azureId.subResource2!.name}'`
    );
  }

  return networkConfig;
}

export function getIpConfigRecipe(
  nicRecipe: AzureVmssNetworkInterfaceConfig,
  azureId: AzureId
): AzureVmssIpConfiguration {
  const ipconfigRecipe = nicRecipe.properties.ipConfigurations.find(
    input => input.name === azureId.subResource3!.name
  );

  if (!ipconfigRecipe) {
    throw new TypeError(
      `Incomplete graph. Unable to locate VMSS '${asRootId(
        azureId
      )}' with ip config '${azureId.subResource3!.name}'`
    );
  }

  return ipconfigRecipe;
}
