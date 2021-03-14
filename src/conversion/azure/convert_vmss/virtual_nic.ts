import {commonTypes} from '../convert_common';
import {materializeNetworkInterface} from '../convert_network_interface';
import {inboundOutboundKeys, normalizedSymbolKey} from '../formatters';
import {
  AnyAzureObject,
  AzureObjectType,
  AzureVirtualMachineScaleSet,
  AzureVMSSIpResult,
  AzureVmssNetworkInterfaceConfig,
  INetworkInterfaceNode,
  IReleatedX,
  IVmssVirutalIpNode,
} from '../types';
import {getIpConfigWithNic, parseAsVMSSNicConfiguration} from './vmss_common';

function* relatedVmssVirtualNicItemKeys(
  spec: AzureVMSSIpResult,
  nicSpec: AzureVmssNetworkInterfaceConfig
): IterableIterator<string> {
  yield spec.vmssId.id;

  if (nicSpec.properties.networkSecurityGroup) {
    yield nicSpec.properties.networkSecurityGroup.id;
  }

  yield nicSpec.properties.ipConfigurations[0].properties.subnet.id;
}

export function createVMSSVirtualIpNIC(
  services: IReleatedX,
  spec: AnyAzureObject
): INetworkInterfaceNode {
  const vmssId = parseAsVMSSNicConfiguration(spec);
  const vmSpec = services.getSpec<AzureVirtualMachineScaleSet>(
    vmssId.vmssId.id
  );
  const config = getIpConfigWithNic(vmssId, vmSpec, true);
  const common = commonTypes(spec, services);

  const virtualIps = () => {
    return services.getRelated<IVmssVirutalIpNode>(
      spec,
      AzureObjectType.VMSS_VIRTUAL_IP
    );
  };
  const keys = inboundOutboundKeys(spec);
  const node = {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: keys.inbound,
    specId: spec.id,
    keys: keys,
    type: AzureObjectType.NIC,
    subnet: common.subnet,
    ips: virtualIps,
    nsg: common.nsg,
    relatedSpecIds: () => {
      return relatedVmssVirtualNicItemKeys(vmssId, config.nicSpec);
    },
    materialize: () => {
      return materializeNetworkInterface(node);
    },
  };
  return node;
}
