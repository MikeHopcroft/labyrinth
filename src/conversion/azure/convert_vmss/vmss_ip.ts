import {asRootId} from '../azure_id';
import {AzureObjectIndex} from '../azure_object_index';
import {
  AzureObjectBase,
  AzureObjectType,
  AzurePrivateIP,
  AzureSubnet,
  AzureVirtualMachineScaleSet,
} from '../azure_types';
import {
  getIpConfigRecipe,
  getNetworkConfigRecipe,
  parseAsVMSSIpConfiguration,
} from './vmss_id';

export function createVmssIpSpec(
  ref: AzureObjectBase,
  index: AzureObjectIndex
): AzurePrivateIP {
  if (index.has(ref.id)) {
    return index.dereference(ref);
  }

  const azureId = parseAsVMSSIpConfiguration(ref);
  const vmssSpec = index.dereference<AzureVirtualMachineScaleSet>(
    asRootId(azureId)
  );
  const nicRecipe = getNetworkConfigRecipe(vmssSpec, azureId);
  const ipRecipe = getIpConfigRecipe(nicRecipe, azureId);

  const subnet = index.dereference<AzureSubnet>(ipRecipe.properties.subnet);
  index.allocator.registerSubnet(subnet.id, subnet.properties.addressPrefix);

  const ip: AzurePrivateIP = {
    id: ref.id,
    type: AzureObjectType.PRIVATE_IP,
    name: ipRecipe.name,
    resourceGroup: vmssSpec.resourceGroup,
    properties: {
      subnet: ipRecipe.properties.subnet,
      privateIPAddress: index.allocator.allocate(subnet.id, ref.id),
    },
  };

  index.add(ip);

  return ip;
}
