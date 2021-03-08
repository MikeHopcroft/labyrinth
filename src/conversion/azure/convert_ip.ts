import {commonTypes, noOpMaterialize} from './convert_common';
import {normalizedSymbolKey, subnetKeys} from './formatters';
import {
  AnyAzureObject,
  AzureIPConfiguration,
  IpNode,
  IReleatedX,
  isLocalIp,
} from './types';

const KEY_INTERNET = 'Internet';

function getIp(spec: AzureIPConfiguration): string {
  if (isLocalIp(spec)) {
    if (!spec.properties.subnet) {
      throw new TypeError(`Local IP '${spec.id}' is not bound to a subnet`);
    }

    return spec.properties.privateIPAddress;
  } else {
    return spec.properties.ipAddress;
  }
}

function* relatedItemKeys(
  spec: AzureIPConfiguration
): IterableIterator<string> {
  if (isLocalIp(spec)) {
    if (spec.properties.subnet) {
      yield spec.properties.subnet.id;
    }
  }
}

function internetOrSubnetKey(spec: AzureIPConfiguration): string {
  let key = KEY_INTERNET;

  if (isLocalIp(spec) && spec.properties.subnet) {
    key = subnetKeys(spec.properties.subnet).inbound;
  }

  return key;
}

export function createIpNode(
  services: IReleatedX,
  input: AnyAzureObject
): IpNode {
  const spec = input as AzureIPConfiguration;
  const ipAddress = getIp(spec);
  const common = commonTypes(spec, services);
  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: internetOrSubnetKey(spec),
    specId: spec.id,
    type: spec.type,
    relatedSpecIds: () => {
      return relatedItemKeys(spec);
    },
    ipAddress,
    subnet: common.subnet,
    materialize: noOpMaterialize,
  };
}
