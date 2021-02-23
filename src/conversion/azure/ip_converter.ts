import {ForwardRuleSpec, NodeSpec} from '../../graph';

import {IEntityStore} from '..';

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
      // TODO: Review the usage of desinationIp which requires a symbol
      destinationIp: subnet,
      destination: subnet,
    });
  }

  return rules;
}

// TODO: Rename and don't use parse
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

// TODO: Rename and don't use parse
function parsePublicIpSpec(
  publicIp: AzurePublicIp,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const ip = publicIp.properties.ipAddress;
  // TODO: Verify ? operator behavior
  const rules = parseSubnetRules(publicIp.properties.subnet?.id, store);
  return parseNodeSpecs(publicIp, store, ip, rules);
}

export const PublicIpConverter: IAzureConverter<AzurePublicIp> = {
  supportedType: 'microsoft.network/publicipaddresses',
  monikers: parseMonikers,
  convert: parsePublicIpSpec,
};

export const LocalIpConverter: IAzureConverter<AzureLocalIP> = {
  supportedType: 'Microsoft.Network/networkInterfaces/ipConfigurations',
  monikers: parseMonikers,
  convert: parseLocalIpSpec,
};

export const IpConverters = ConverterStore.create<AzureIPConfiguration>(
  PublicIpConverter,
  LocalIpConverter
);
