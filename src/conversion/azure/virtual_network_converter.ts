import DRange from 'drange';

import {
  createIpFormatter,
  DimensionType,
  formatDRange,
  Formatter,
  IEntityStore,
  parseIp,
  ForwardRuleSpecEx,
  NodeSpec,
  SymbolStore,
} from '../..';

import {
  IAzureConverter,
  ItemMoniker,
  AnyAzureObject,
  AzureVirtualNetwork,
  parseMonikers,
  SubnetConverter,
} from '.';

const subnetConverter = SubnetConverter;

export class VirtualNetworkConverter implements IAzureConverter {
  private readonly ipFormatter: Formatter;
  private readonly symbols: SymbolStore;
  private readonly vnets: Map<string, string>;
  readonly supportedType: string;

  constructor(symbols: SymbolStore) {
    this.supportedType = 'microsoft.network/virtualnetworks';
    this.ipFormatter = createIpFormatter(new Map<string, string>());
    this.symbols = symbols;
    this.vnets = new Map<string, string>();
  }

  monikers(input: AnyAzureObject): ItemMoniker[] {
    const monikers = parseMonikers(input);
    const vnet = input as AzureVirtualNetwork;

    for (const subnet of vnet.properties.subnets) {
      for (const alias of subnetConverter.monikers(subnet)) {
        monikers.push(alias);
      }
    }

    return monikers;
  }

  convert(
    input: AnyAzureObject,
    store: IEntityStore<AnyAzureObject>
  ): NodeSpec[] {
    // This DimensionType is needed to parse IP addresses.
    // TODO: is there a lower-level API for parsing that doesn't
    // require a DimensionType?
    const ipDimensionType = new DimensionType({
      name: 'ip address',
      key: 'ip',
      parser: 'ip',
      formatter: 'ip',
      domain: '0.0.0.0-255.255.255.255',
      values: [],
    });

    const nodes: NodeSpec[] = [];
    const vnet = input as AzureVirtualNetwork;
    const addressRange = new DRange();
    const addresses = vnet.properties.addressSpace.addressPrefixes.join(', ');
    for (const address of vnet.properties.addressSpace.addressPrefixes) {
      const ip = parseIp(ipDimensionType, address);
      addressRange.add(ip);
    }
    const alias = vnet.name;
    this.vnets.set(alias, alias);

    // Define symbol/service tag for this virtual network.
    const addressRangeText = formatDRange(this.ipFormatter, addressRange);
    this.symbols.push('ip', vnet.name, addressRangeText);

    const rules: ForwardRuleSpecEx[] = [
      // Traffic leaving subnet
      {
        destination: 'Internet',
        // TODO: use addressRangeText here.
        destinationIp: `except ${addresses}`,
      },
    ];

    for (const subnet of vnet.properties.subnets) {
      const subnetNodes = subnetConverter.convert(subnet, store);

      // 0 - Router
      // 1 - Inbound
      // 2 - Outbound
      const child = subnetNodes[1].key;

      for (const subnetNode of subnetNodes) {
        if (subnetNode.rules.length === 0) {
          subnetNode.rules.push({
            destination: alias,
          });
        }

        nodes.push(subnetNode);
      }

      // Traffic to child of subnet
      rules.push({
        destination: child,
        destinationIp: subnet.properties.addressPrefix,
      });
    }

    nodes.push({
      key: alias,
      range: {
        sourceIp: addressRangeText,
      },
      rules,
    });

    return nodes;
  }

  public virtualNetworks(): string[] {
    return Array.from(this.vnets.keys());
  }
}
