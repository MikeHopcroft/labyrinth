import DRange from 'drange';

import {ForwardRuleSpec, NodeSpec, SymbolStore} from '../../graph';
import {
  DimensionType,
  createIpFormatter,
  formatDRange,
  Formatter,
  parseIp,
} from '../../dimensions';

import {IEntityStore} from '..';

import {
  IAzureConverter,
  ItemMoniker,
  AnyAzureObject,
  AzureVirtualNetwork,
  extractMonikers,
  SubnetConverter,
} from '.';

export class VirtualNetworkConverter
  implements IAzureConverter<AzureVirtualNetwork> {
  private readonly ipFormatter: Formatter;
  private readonly symbols: SymbolStore;
  private readonly vnets: Set<string>;
  readonly supportedType: string;

  constructor(symbols: SymbolStore) {
    this.supportedType = 'microsoft.network/virtualnetworks';
    this.ipFormatter = createIpFormatter(new Map<string, string>());
    this.symbols = symbols;
    this.vnets = new Set<string>();
  }

  monikers(vnet: AzureVirtualNetwork): ItemMoniker[] {
    const monikers = extractMonikers(vnet);

    for (const subnet of vnet.properties.subnets) {
      for (const alias of SubnetConverter.monikers(subnet)) {
        monikers.push(alias);
      }
    }

    return monikers;
  }

  convert(
    vnet: AzureVirtualNetwork,
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
    const addressRange = new DRange();
    const addresses = vnet.properties.addressSpace.addressPrefixes.join(', ');
    for (const address of vnet.properties.addressSpace.addressPrefixes) {
      const ip = parseIp(ipDimensionType, address);
      addressRange.add(ip);
    }
    const alias = vnet.name;
    this.vnets.add(alias);

    // Define symbol/service tag for this virtual network.
    const addressRangeText = formatDRange(this.ipFormatter, addressRange);
    // TODO This function signature (for push) always confuses me. My bad.
    this.symbols.push('ip', vnet.name, addressRangeText);

    const rules: ForwardRuleSpec[] = [
      // Traffic leaving subnet
      {
        // TODO KEY_INTERNET
        destination: 'Internet',
        // TODO: use addressRangeText here.
        destinationIp: `except ${addresses}`,
      },
    ];

    for (const subnet of vnet.properties.subnets) {
      const subnetNodes = SubnetConverter.convert(subnet, store);

      // TODO: Still need to figure out how to make this less brittle.
      // Or just add WARNING comments on both ends.
      // 0 - Router
      // 1 - Inbound
      // 2 - Outbound
      const child = subnetNodes[1].key;

      for (const subnetNode of subnetNodes) {
        // TODO: Do we really want to patch the subnet rules here vs passing the vnet down?
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
    return [...this.vnets.values()];
  }
}
