import {IEntityStore, ForwardRuleSpec, NodeSpec} from '../..';

import {
  AnyAzureObject,
  AzureIPConfiguration,
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
  const key = store.getAlias(input.id);

  return [
    {
      key,
      endpoint: true,
      range: {
        sourceIp: ip,
      },
      rules: subnetRules,
    },
  ];
}

function parseLocalIpSpec(
  localIp: AzureLocalIP,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const ip = localIp.properties.privateIPAddress;
  const rules = parseSubnetRules(localIp.properties.subnet?.id, store);
  return parseNodeSpecs(localIp, store, ip, rules);
}

function parsePublicIpSpec(
  publicIp: AzurePublicIp,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const ip = publicIp.properties.ipAddress;
  const rules = parseSubnetRules(publicIp.properties.subnet?.id, store);
  return parseNodeSpecs(publicIp, store, ip, rules);
}

export const PublicIpConverter = {
  supportedType: 'microsoft.network/publicipaddresses',
  monikers: parseMonikers,
  convert: parsePublicIpSpec,
} as IAzureConverter<AzurePublicIp>;

export const LocalIpConverter = {
  supportedType: 'Microsoft.Network/networkInterfaces/ipConfigurations',
  monikers: parseMonikers,
  convert: parseLocalIpSpec,
} as IAzureConverter<AzureLocalIP>;

export const IpConverters = ConverterStore.create<AzureIPConfiguration>(
  PublicIpConverter,
  LocalIpConverter
);
