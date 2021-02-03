import fs from 'fs';
import * as yaml from 'js-yaml';

// import {Universe} from '../dimensions';

import {
  ForwardRuleSpecEx,
  GraphSpec,
  NodeSpec,
  SymbolDefinitionSpec
} from '../graph';

import {
  ActionType,
  RuleSpec,
} from '../rules';

// import {firewallSpec} from '../specs';
// import {createSimplifier, Simplifier} from '../setops';

import {
  AnyAzureObject,
  asAzureNetworkInterface,
  asAzureVirtualNetwork,
  AzureIPConfiguration,
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzureObjectBase,
  AzureReference,
  AzureSecurityRule,
  AzureSubnet,
  AzureVirtualNetwork,
} from './azure_types';

export function convert(infile: string, outfile: string): GraphSpec {
  const idToItem = new Map<string, AnyAzureObject>();
  const idToAlias = new Map<string, string>();
  const nodes: NodeSpec[] = [];

  // TODO: create real Azure UniverseSpec, instead of adding symbols here.
  const symbols: SymbolDefinitionSpec[] = [
    {
      dimension: 'ip',
      symbol: 'AzureLoadBalancer',
      range: '168.63.129.16',
    },
    {
      dimension: 'ip',
      symbol: 'Internet',
      range: 'internet',
    },
    {
      dimension: 'protocol',
      symbol: 'Tcp',
      range: 'tcp',
    },
  ];

  // patchFirewallSpec();
  // const universe = new Universe(firewallSpec);
  // const simplifier: Simplifier<RuleSpec> = createSimplifier<RuleSpec>(universe);

  const text = fs.readFileSync(infile, 'utf8');
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

  // for (const item of idToItem.values()) {
  //   console.log(`${item.name}: ${item.type}`);
  //   const vnet = asAzureVirtualNetwork(item);
  //   if (vnet) {
  //     convertVNet(vnet);
  //   }
  // }

  const graph = {symbols, nodes};
  const yamlText = yaml.dump(graph);
  fs.writeFileSync(outfile, yamlText, 'utf8');

  console.log('done');
  return graph;

  function convertResourceGroup() {
    const alias = 'Internet';

    const rules: ForwardRuleSpecEx[] = [
    ];

    //
    // Convert each VNet
    //
    for (const item of idToItem.values()) {
      console.log(`${item.name}: ${item.type}`);
      const vnet = asAzureVirtualNetwork(item);
      if (vnet) {
        const addresses = vnet.properties.addressSpace.addressPrefixes.join(', ');
        const child = convertVNet(vnet, alias);
        rules.push({
          destination: child,
          destinationIp: addresses,
        });
      }
    }

    nodes.push({
      key: alias,
      endpoint: true,
      rules
    });
  }

  function convertVNet(vnet: AzureVirtualNetwork, parent: string): string {
    const addresses = vnet.properties.addressSpace.addressPrefixes.join(', ');
    const alias = getAlias(vnet);
    // const router = alias + '/router';

    defineSymbol('ip', vnet.name, addresses);
    // universe.defineSymbol('ip', vnet.name, addresses, true);

    const rules: ForwardRuleSpecEx[] = [
      // Traffice leaving subnet
      {
        destination: parent,
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
    console.log(`      ipConfigurations:`);

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
      rules,
    }
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
      rules: [
        {
          destination: routerKey
        }
      ],
    };
    nodes.push(inboundNode);

    const outboundNode: NodeSpec = {
      key: outboundKey,
      filters: outbound,
      rules: [
        {
          destination: parent
        }
      ],
    };
    nodes.push(outboundNode);

    // convertNSG(
    //   vnet,
    //   dereference<AzureNetworkSecurityGroup>(
    //     subnet.properties.networkSecurityGroup
    //   )
    // );

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
      rules: [
        {
          destination: parent
        },
      ]
    };
    nodes.push(spec);
    return key;
  }

  function convertNSG(
    vnet: AzureVirtualNetwork,
    nsg: AzureNetworkSecurityGroup
  ): {inbound: RuleSpec[], outbound: RuleSpec[]} {
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

    // const x = denyOverrides(inbound, simplifier);
    // console.log();
    // console.log('        CONSOLIDATED INBOUND:');
    // console.log(x.format({prefix: '          '}));

    // const y = denyOverrides(outbound, simplifier);
    // console.log();
    // console.log('        CONSOLIDATED OUTBOUND:');
    // console.log(y.format({prefix: '          '}));

    // return {inbound: x, outbound: y};
    return {inbound, outbound};
  }

  function convertRule(
    vnet: AzureVirtualNetwork,
    rule: AzureSecurityRule
  ): RuleSpec {
    const action = (
      rule.properties.access === 'Allow' ? 
      ActionType.ALLOW : 
      ActionType.DENY
    );
    const priority = rule.properties.priority;

    // TODO: sourcePortRanges, sourceAddressPrefixes, etc.
    let sourceIp = rule.properties.sourceAddressPrefix;
    if (sourceIp === 'VirtualNetwork') {
      sourceIp = vnet.name;
    }

    const sourcePort = rule.properties.sourcePortRange;

    let destinationIp = rule.properties.destinationAddressPrefix;
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
    }

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

    // const r = parseRuleSpec(universe, spec);
    // console.log(r.conjunction.format({prefix: '            '}));

    // return r;
    return spec;
  }

  function defineSymbol(dimension: string, symbol: string, range: string) {
    symbols.push({dimension, symbol, range});
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Graph construction functions
  //
  /////////////////////////////////////////////////////////////////////////////

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

  // // TODO: Replace the patchFirewallSpec() hack with a real Azure UniverseSpec.
  // // May need some way to specify the ip addresses for the AzureLoadBalancer.
  // // Consider a factory that generates the spec from a smaller temple with
  // // values for tags.
  // function patchFirewallSpec() {
  //   firewallSpec.types[0].values.push({
  //     symbol: 'Internet',
  //     range: '0.0.0.0-255.255.255.255',
  //   });
  
  //   firewallSpec.types[2].values.push({
  //     symbol: 'Tcp',
  //     range: '6',
  //   });

  //   firewallSpec.types[0].values.push({
  //     symbol: 'AzureLoadBalancer',
  //     // TODO: get real load-balancer ip address.
  //     // Random, made-up ip address for load balancer.
  //     range: '5.6.7.8',
  //   });
  // }
}
