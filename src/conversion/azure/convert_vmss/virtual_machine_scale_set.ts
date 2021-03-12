import {commonTypes, noOpMaterialize} from '../convert_common';
import {normalizedSymbolKey, normalizedNodeKey} from '../formatters';

import {
  AzureVirtualMachineScaleSet,
  AzureVMSSIpResult,
  IReleatedX,
  IVirutalMachineScaleSetNode,
} from '../types';
import {getIpConfigWithNic} from './vmss_common';

function* relatedVMSSItemKeys(
  spec: AzureVirtualMachineScaleSet
): IterableIterator<string> {
  for (const netConfig of spec.properties.virtualMachineProfile.networkProfile
    .networkInterfaceConfigurations) {
    for (const ipconfig of netConfig.properties.ipConfigurations) {
      yield ipconfig.properties.subnet.id;
    }
  }
}

export function createVirtualMachineScaleSetNode(
  services: IReleatedX,
  spec: AzureVirtualMachineScaleSet
): IVirutalMachineScaleSetNode {
  const common = commonTypes(spec, services);

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    interfaceConfigs:
      spec.properties.virtualMachineProfile.networkProfile
        .networkInterfaceConfigurations,
    relatedSpecIds: () => {
      return relatedVMSSItemKeys(spec);
    },
    materialize: noOpMaterialize,
    getSubnet: (vmssIds: AzureVMSSIpResult) => {
      const {ipconfigSpec} = getIpConfigWithNic(vmssIds, spec);

      const subnetNode = [...common.subnets()].find(
        x => x.specId === ipconfigSpec.properties.subnet.id
      );

      if (!subnetNode) {
        throw new TypeError('Invalid VMSS graph');
      }

      return subnetNode;
    },
  };
}
