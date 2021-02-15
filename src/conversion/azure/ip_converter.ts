import {ForwardRuleSpec, NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {
  AnyAzureObject,
  AzurePublicIp,
  AzureLocalIP,
  ConverterStore,
  IAzureConverter,
  parseMonikers,
} from '.';

function parseSubnetRules(
  subnetId: string | undefined,
  store: IEntityStore<AnyAzureObject>
): ForwardRuleSpec[] {
  const rules: ForwardRuleSpec[] = [];

  if (subnetId) {
    const subnet = store.getAlias(subnetId);

    rules.push({
      destinationIp: subnet,
      destination: subnet,
    });
  }

  return rules;
}

function parseNodeSpecs(
  input: AnyAzureObject,
  store: IEntityStore<AnyAzureObject>,
  ip: string,
  subnetRules: ForwardRuleSpec[]
): NodeSpec[] {
  const result: NodeSpec[] = [];
  const key = store.getAlias(input.id);

  result.push({
    key,
    endpoint: true,
    range: {
      sourceIp: ip,
    },
    rules: subnetRules,
  });

  return result;
}

function parseLocalIpSpec(
  input: AnyAzureObject,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const localIp = input as AzureLocalIP;
  const ip = localIp.properties.privateIPAddress;
  const rules = parseSubnetRules(localIp.properties.subnet?.id, store);
  return parseNodeSpecs(input, store, ip, rules);
}

function parsePublicIpSpec(
  input: AnyAzureObject,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const publicIp = input as AzurePublicIp;
  const ip = publicIp.properties.ipAddress;
  const rules = parseSubnetRules(publicIp.properties.subnet?.id, store);
  return parseNodeSpecs(input, store, ip, rules);
}

export const PublicIpConverter = {
  supportedType: 'microsoft.network/publicipaddresses',
  monikers: parseMonikers,
  convert: parsePublicIpSpec,
} as IAzureConverter;

export const LocalIpConverter = {
  supportedType: 'Microsoft.Network/networkInterfaces/ipConfigurations',
  monikers: parseMonikers,
  convert: parseLocalIpSpec,
} as IAzureConverter;

export const IpConverters = ConverterStore.create(
  PublicIpConverter,
  LocalIpConverter
);
