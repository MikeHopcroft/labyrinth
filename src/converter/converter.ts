import DRange from 'drange';
import * as yaml from 'js-yaml';
import {FileSystem} from '..';

import {
  createIpFormatter,
  DimensionType,
  formatDRange,
  parseIp,
} from '../dimensions';

import {
  ForwardRuleSpecEx,
  GraphSpec,
  NodeSpec,
  SymbolDefinitionSpec,
} from '../graph';

import {ActionType, RuleSpec} from '../rules';

import {
  AnyAzureObject,
  asAzureNetworkInterface,
  asAzureVirtualNetwork,
  AzureIPConfiguration,
  AzureNetworkSecurityGroup,
  AzureObjectBase,
  AzureReference,
  AzureSecurityRule,
  AzureSubnet,
  AzureVirtualNetwork,
} from './azure_types';

export function convert(infile: string, outfile: string): GraphSpec {
  // Indexes mapping AzureObjectBase.id to AnyAzureObject
  const idToItem = new Map<string, AnyAzureObject>();
  const idToAlias = new Map<string, string>();

  // Nodes that make up the graph.
  const nodes: NodeSpec[] = [];

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
  const ipFormatter = createIpFormatter(new Map<string, string>());

  // List of aliases of virtual networks inside the resource group.
  // Used to define the `Internet` service tag.
  const vNetAddresses: string[] = [];

  // TODO: create real Azure UniverseSpec, instead of hard-coding symbols here.
  const symbols: SymbolDefinitionSpec[] = [
    {
      dimension: 'ip',
      symbol: 'AzureLoadBalancer',
      range: '168.63.129.16',
    },
    {
      dimension: 'protocol',
      symbol: 'Tcp',
      range: 'tcp',
    },
  ];

  // Read and parse the Azure resource graph file.
  const text = FileSystem.readUtfFileSync(infile);
  const root = JSON.parse(text) as AnyAzureObject[];

  //
  // Index items and aliases in resource graph
  //

  for (const item of root.values()) {
    idToItem.set(item.id, item);
    idToAlias.set(item.id, item.name);

    const nic = asAzureNetworkInterface(item);
    const vnet = asAzureVirtualNetwork(item);

    if (nic) {
      for (const config of nic.properties.ipConfigurations) {
        // Index ip configuration so that it can be found by reference.
        idToItem.set(config.id, config);

        // Generate unique alias for ip configuration from its parent
        // network interface.
        idToAlias.set(config.id, `${nic.name}/${config.name}`);
      }
    } else if (vnet) {
      for (const subnet of vnet.properties.subnets) {
        // Index subnet so that it can be found by reference.
        idToItem.set(subnet.id, subnet);
        idToAlias.set(subnet.id, subnet.name);
      }
    }
  }

  convertResourceGroup();

  const graph = {symbols, nodes};
  const yamlText = yaml.dump(graph);
  FileSystem.writeUtfFileSync(outfile, yamlText);

  console.log('done');
  return graph;

  /////////////////////////////////////////////////////////////////////////////
  //
  // Locally-scoped function definitions follow.
  //
  /////////////////////////////////////////////////////////////////////////////
  function convertResourceGroup() {
    const alias = 'Internet';

    // Convert each VNet
    const rules: ForwardRuleSpecEx[] = [];
    for (const item of idToItem.values()) {
      console.log(`${item.name}: ${item.type}`);
      const vnet = asAzureVirtualNetwork(item);
      if (vnet) {
        const child = convertVNet(vnet, alias);
        rules.push({
          destination: child,
          destinationIp: vnet.name,
        });

        vNetAddresses.push(vnet.name);
      }
    }

    // Define the `Internet` service tag as all ip addresses not part of
    // a virtual network.
    const range = vNetAddresses.join(',');
    const internet = `except ${range}`;
    defineSymbol('ip', 'Internet', internet, true);

    nodes.push({
      key: alias,
      endpoint: true,
      range: {
        sourceIp: 'Internet',
      },
      rules,
    });
  }

  function convertVNet(vnet: AzureVirtualNetwork, parent: string): string {
    const addressRange = new DRange();
    const addresses = vnet.properties.addressSpace.addressPrefixes.join(', ');
    for (const address of vnet.properties.addressSpace.addressPrefixes) {
      const ip = parseIp(ipDimensionType, address);
      addressRange.add(ip);
    }
    const alias = getAlias(vnet);

    // Define symbol/service tag for this virtual network.
    const addressRangeText = formatDRange(ipFormatter, addressRange);
    defineSymbol('ip', vnet.name, addressRangeText);

    const rules: ForwardRuleSpecEx[] = [
      // Traffic leaving subnet
      {
        destination: parent,
        // TODO: use addressRangeText here.
        destinationIp: `except ${addresses}`,
      },
    ];

    console.log(`  VNet: ${getAlias(vnet)}`);
    console.log(`    address prefixes: [${addresses}]`);

    for (const subnet of vnet.properties.subnets) {
      const child = convertSubnet(vnet, subnet, alias);

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

    return alias;
  }

  function convertSubnet(
    vnet: AzureVirtualNetwork,
    subnet: AzureSubnet,
    parent: string
  ): string {
    const alias = getAlias(subnet);
    console.log(`    Subnet: ${alias}`);
    console.log(`      addressPrefix: ${subnet.properties.addressPrefix}`);
    console.log('      ipConfigurations:');

    // TODO: come up with safer naming scheme. Want to avoid collisions
    // with other names.
    const inboundKey = alias + '/inbound';
    const outboundKey = alias + '/outbound';
    const routerKey = alias + '/router';

    const rules: ForwardRuleSpecEx[] = [
      // Traffice leaving subnet
      {
        destination: outboundKey,
        destinationIp: `except ${subnet.properties.addressPrefix}`,
      },
    ];

    for (const ref of subnet.properties.ipConfigurations) {
      const ipConfig = dereference<AzureIPConfiguration>(ref);
      const child = convertIpConfiguration(ipConfig, routerKey);

      // Traffic to child of subnet
      rules.push({
        destination: child,
        destinationIp: ipConfig.properties.privateIPAddress,
      });
    }

    const routerNode: NodeSpec = {
      key: routerKey,
      range: {
        sourceIp: subnet.properties.addressPrefix,
      },
      rules,
    };
    nodes.push(routerNode);

    const {inbound, outbound} = convertNSG(
      vnet,
      dereference<AzureNetworkSecurityGroup>(
        subnet.properties.networkSecurityGroup
      )
    );

    const inboundNode: NodeSpec = {
      key: inboundKey,
      filters: inbound,
      // NOTE: no range because inbound can receive from any sourceIp
      // TODO: is this correct? The router moves packets in both directions.
      rules: [
        {
          destination: routerKey,
        },
      ],
    };
    nodes.push(inboundNode);

    const outboundNode: NodeSpec = {
      key: outboundKey,
      filters: outbound,
      range: {
        sourceIp: subnet.properties.addressPrefix,
      },
      rules: [
        {
          destination: parent,
        },
      ],
    };
    nodes.push(outboundNode);

    return inboundKey;
  }

  function convertIpConfiguration(
    config: AzureIPConfiguration,
    parent: string
  ) {
    const key = getAlias(config);
    console.log(`        ${key} (${config.properties.privateIPAddress})`);
    const spec: NodeSpec = {
      key,
      endpoint: true,
      range: {
        sourceIp: config.properties.privateIPAddress,
      },
      rules: [
        {
          destination: parent,
        },
      ],
    };
    nodes.push(spec);

    // TODO: enable this code after sorting out illegal symbol errors.
    // Problem is that Azure names have slashes.
    // defineSymbol('ip', key, config.properties.privateIPAddress);

    return key;
  }

  function convertNSG(
    vnet: AzureVirtualNetwork,
    nsg: AzureNetworkSecurityGroup
  ): {inbound: RuleSpec[]; outbound: RuleSpec[]} {
    const inbound: RuleSpec[] = [];
    const outbound: RuleSpec[] = [];

    console.log(`      Network Security Group: ${getAlias(nsg)}`);
    console.log('        Default rules');
    for (const rule of nsg.properties.defaultSecurityRules) {
      console.log(`          ${rule.name} (${rule.properties.priority})`);
      const r = convertRule(vnet, rule);
      if (rule.properties.direction === 'Inbound') {
        inbound.push(r);
      } else {
        outbound.push(r);
      }
    }
    console.log('        Rules');
    for (const rule of nsg.properties.securityRules) {
      console.log(`          ${rule.name} (${rule.properties.priority})`);
      const r = convertRule(vnet, rule);
      if (rule.properties.direction === 'Inbound') {
        inbound.push(r);
      } else {
        outbound.push(r);
      }
    }

    return {inbound, outbound};
  }

  function convertRule(
    vnet: AzureVirtualNetwork,
    rule: AzureSecurityRule
  ): RuleSpec {
    const action =
      rule.properties.access === 'Allow' ? ActionType.ALLOW : ActionType.DENY;
    const priority = rule.properties.priority;

    // TODO: sourcePortRanges, sourceAddressPrefixes, etc.
    let sourceIp = rule.properties.sourceAddressPrefix;
    // TODO: consider using symbol table here instead of vnet.name.
    if (sourceIp === 'VirtualNetwork') {
      sourceIp = vnet.name;
    }

    const sourcePort = rule.properties.sourcePortRange;

    // TODO: destinationPortRanges, destinationAddressPrefixes, etc.
    let destinationIp = rule.properties.destinationAddressPrefix;
    // TODO: consider using symbol table here instead of vnet.name.
    if (destinationIp === 'VirtualNetwork') {
      destinationIp = vnet.name;
    }

    const destinationPort = rule.properties.destinationPortRange;
    const protocol = rule.properties.protocol;

    const spec: RuleSpec = {
      action,
      priority,
      // TODO: set id and source fields correctly.
      id: 1,
      source: infile,
    };

    if (sourceIp) {
      spec.sourceIp = sourceIp;
    }
    if (sourcePort) {
      spec.sourcePort = sourcePort;
    }
    if (destinationIp) {
      spec.destinationIp = destinationIp;
    }
    if (destinationPort) {
      spec.destinationPort = destinationPort;
    }
    if (protocol) {
      spec.protocol = protocol;
    }

    return spec;
  }

  function defineSymbol(
    dimension: string,
    symbol: string,
    range: string,
    insertAtHead = false
  ) {
    const spec: SymbolDefinitionSpec = {dimension, symbol, range};
    if (insertAtHead) {
      symbols.unshift(spec);
    } else {
      symbols.push(spec);
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Utility functions
  //
  /////////////////////////////////////////////////////////////////////////////
  function dereference<T extends AnyAzureObject>(ref: AzureReference<T>) {
    const item = idToItem.get(ref.id);
    if (item === undefined) {
      const message = `Unknown Azure resource graph reference "${ref.id}".`;
      throw new TypeError(message);
    }

    // TODO: verify type field value is correct for type T.

    return item as T;
  }

  function getAlias(item: AzureObjectBase) {
    return idToAlias.get(item.id) ?? '(unknown)';
  }
}
