import {noOpMaterialize} from '../convert_common';
import {normalizedSymbolKey, normalizedNodeKey} from '../formatters';

import {
  AnyAzureObject,
  AzureObjectType,
  AzureVMSSIpResult,
  IReleatedX,
  IVirutalMachineScaleSetNode,
  IVmssVirutalIpNode,
} from '../types';

import {asNicConfigSpecId, parseAsVMSSIpConfiguration} from './vmss_common';

function* relatedVmssVirtualIpItemKeys(
  spec: AzureVMSSIpResult
): IterableIterator<string> {
  yield spec.vmssId.id;
  yield asNicConfigSpecId(spec);
}

export function createVMSSVirtualIpNode(
  services: IReleatedX,
  spec: AnyAzureObject
): IVmssVirutalIpNode {
  const vmssId = parseAsVMSSIpConfiguration(spec);

  const vmss = () => {
    return services.getSingle<IVirutalMachineScaleSetNode>(
      spec,
      AzureObjectType.VIRTUAL_MACHINE_SCALE_SET
    );
  };

  const subnet = () => {
    return vmss().getSubnet(vmssId);
  };

  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: AzureObjectType.VMSS_VIRTUAL_IP,
    ipAddress: 'VMSS-VIRTUAL-IP',
    subnet,
    relatedSpecIds: () => {
      return relatedVmssVirtualIpItemKeys(vmssId);
    },
    materialize: noOpMaterialize,
  };
}
