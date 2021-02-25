import {ForwardRuleSpec, NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {
  AnyAzureObject,
  AzureIPConfiguration,
  AzurePublicIp,
  AzureLocalIP,
  ConverterStore,
  IAzureConverter,
  extractMonikers,
} from '.';

function createSubnetRules(
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

function createIpNodeSpecs(
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

function createLocalIpNodeSpec(
  localIp: AzureLocalIP,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const ip = localIp.properties.privateIPAddress;
  const rules = createSubnetRules(localIp.properties.subnet?.id, store);
  return createIpNodeSpecs(localIp, store, ip, rules);
}

function createPublicIpNodeSpec(
  publicIp: AzurePublicIp,
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const ip = publicIp.properties.ipAddress;
  // TODO: Verify ? operator behavior
  const rules = createSubnetRules(publicIp.properties.subnet?.id, store);
  return createIpNodeSpecs(publicIp, store, ip, rules);
}

export const PublicIpConverter: IAzureConverter<AzurePublicIp> = {
  supportedType: 'microsoft.network/publicipaddresses',
  monikers: extractMonikers,
  convert: createPublicIpNodeSpec,
};

export const LocalIpConverter: IAzureConverter<AzureLocalIP> = {
  supportedType: 'Microsoft.Network/networkInterfaces/ipConfigurations',
  monikers: extractMonikers,
  convert: createLocalIpNodeSpec,
};

export const IpConverters = ConverterStore.create<AzureIPConfiguration>(
  PublicIpConverter,
  LocalIpConverter
);
