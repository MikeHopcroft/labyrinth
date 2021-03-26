import {getIpConfigWithNic, parseAsVMSSIpConfiguration} from '../azure_id';
import {AzureObjectIndex} from '../azure_object_index';
import {
  AzureObjectBase,
  AzureObjectType,
  AzurePrivateIP,
  AzureSubnet,
  AzureVirtualMachineScaleSet,
} from '../azure_types';

export function createVmssIpSpec(
  ref: AzureObjectBase,
  index: AzureObjectIndex
): AzurePrivateIP {
  if (index.has(ref.id)) {
    return index.dereference(ref);
  }

  const vmssId = parseAsVMSSIpConfiguration(ref);
  const vmssSpec = index.dereference<AzureVirtualMachineScaleSet>(
    vmssId.vmssId
  );
  const vmssIpSpec = getIpConfigWithNic(vmssId, vmssSpec).ipconfigSpec;

  const subnet = index.dereference<AzureSubnet>(vmssIpSpec.properties.subnet);
  index.allocator.registerSubnet(subnet.id, subnet.properties.addressPrefix);

  const ip: AzurePrivateIP = {
    id: ref.id,
    type: AzureObjectType.PRIVATE_IP,
    name: vmssIpSpec.name,
    resourceGroup: vmssSpec.resourceGroup,
    properties: {
      subnet: vmssIpSpec.properties.subnet,
      privateIPAddress: index.allocator.allocate(subnet.id, ref.id),
    },
  };

  index.add(ip);

  return ip;
}
