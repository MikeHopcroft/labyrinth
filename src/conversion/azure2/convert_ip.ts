import {AzureId} from './azure_id';
import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';
import {
  AzureIdReference,
  AzureIPConfiguration,
  AzureObjectType,
  AzureVirtualMachineScaleSet,
} from './types';

function convertToIpAddress(ipItem: AzureIPConfiguration): string {
  let ip: string;
  if (ipItem.type === AzureObjectType.LOCAL_IP) {
    ip = ipItem.properties.privateIPAddress;
  } else {
    ip = ipItem.properties.ipAddress;
  }
  return ip;
}

export function convertKnownIp(
  ipConfig: AzureIPConfiguration
): NodeKeyAndSourceIp {
  const ip = convertToIpAddress(ipConfig);
  const ipKey = ipConfig.id;

  return {key: ipKey, destinationIp: ip};
}
export function convertAsVMSSIp(
  services: GraphServices,
  ipRefSpec: AzureIdReference
): NodeKeyAndSourceIp {
  const vmssIds = AzureId.parseAsVMSSIpConfiguration(ipRefSpec);
  const vmss: AzureVirtualMachineScaleSet = services.index.dereference(
    vmssIds.vmssId
  );

  return services.convert.vmssIp(
    services,
    vmss,
    vmssIds.interfaceConfig,
    vmssIds.ipConfig
  );
}

export function convertIp(
  services: GraphServices,
  ipRefSpec: AzureIdReference
): NodeKeyAndSourceIp {
  if (!services.index.has(ipRefSpec)) {
    return convertAsVMSSIp(services, ipRefSpec);
  }

  const ipConfig = services.index.dereference<AzureIPConfiguration>(ipRefSpec);
  return convertKnownIp(ipConfig);
}
