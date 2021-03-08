import {
  AzureObjectBase,
  AzureVirtualMachineScaleSet,
  AzureVMSSIpResult,
} from '../types';

function splitId(input: string): string[] {
  return input.split('/');
}

export function isValidVMSSIpConfigId(id: string): boolean {
  const parts = splitId(id);

  return parts.length === 15 && id.indexOf('virtualmachinescaleset') > 0;
}

export function isValidVMSSIpNic(id: string): boolean {
  const parts = splitId(id);

  return parts.length === 13 && id.indexOf('virtualmachinescaleset') > 0;
}

export function asNicConfigSpecId(input: AzureVMSSIpResult) {
  return `${input.vmssId.id}/virtualmachines/${input.logicalId}/networkinterfaces/${input.interfaceConfig}`;
}

export function parseAsVMSSIpConfiguration(
  input: AzureObjectBase
): AzureVMSSIpResult {
  const parts = splitId(input.id);

  if (parts.length !== 15) {
    throw new TypeError(`Invalid VMSS IP Configuration Id '${input.id}'`);
  }

  return {
    vmssId: {
      id: parts.slice(0, 9).join('/'),
      resourceGroup: input.resourceGroup,
    },
    logicalId: Number.parseInt(parts[10]),
    interfaceConfig: parts[12],
    ipConfig: parts[14],
  };
}

// In the case of Load Balancers which are using VMSS there are references which
// do not contain direct items in the graph. This parsing function extracts the
// separates the id which then can be used to look up necessary downstream items
export function parseAsVMSSNicConfiguration(
  input: AzureObjectBase
): AzureVMSSIpResult {
  const parts = splitId(input.id);

  if (parts.length !== 13) {
    throw new TypeError(`Invalid VMSS Nic Configuration Id '${input.id}'`);
  }

  return {
    vmssId: {
      id: parts.slice(0, 9).join('/'),
      resourceGroup: input.resourceGroup,
    },
    logicalId: Number.parseInt(parts[10]),
    interfaceConfig: parts[12],
    ipConfig: '',
  };
}

export function getIpConfigWithNic(
  vmssIds: AzureVMSSIpResult,
  vmssSpec: AzureVirtualMachineScaleSet,
  useDefault = false
) {
  const networkConfig = vmssSpec.properties.virtualMachineProfile.networkProfile.networkInterfaceConfigurations.find(
    input => input.name.toLowerCase() === vmssIds.interfaceConfig.toLowerCase()
  );

  if (!networkConfig) {
    throw new TypeError(
      `Incomplete graph. Unable to locate VMSS '${vmssSpec.id}' with interface config '${vmssIds.interfaceConfig}'`
    );
  }

  let ipconfigSpec = networkConfig.properties.ipConfigurations.find(
    input => input.name.toLowerCase() === vmssIds.ipConfig.toLowerCase()
  );

  if (!ipconfigSpec) {
    if (useDefault) {
      ipconfigSpec = networkConfig.properties.ipConfigurations[0];
    } else {
      throw new TypeError(
        `Incomplete graph. Unable to locate VMSS '${vmssSpec.id}' with ip config '${vmssIds.ipConfig}'`
      );
    }
  }

  return {
    nicSpec: networkConfig,
    ipconfigSpec,
  };
}
