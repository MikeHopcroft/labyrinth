import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';
import {AzureIPConfiguration, AzureObjectType} from './types';

function convertToIpAddress(ipItem: AzureIPConfiguration): string {
  let ip: string;
  if (ipItem.type === AzureObjectType.LOCAL_IP) {
    ip = ipItem.properties.privateIPAddress;
  } else {
    ip = ipItem.properties.ipAddress;
  }
  return ip;
}

export function convertIp(
  services: GraphServices,
  ipConfig: AzureIPConfiguration
): NodeKeyAndSourceIp {
  const ip = convertToIpAddress(ipConfig);
  const ipKey = ipConfig.id;

  return {key: ipKey, destinationIp: ip};
}
