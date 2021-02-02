import fs from 'fs';

import {Universe} from '../dimensions';

import {
  ActionType,
  denyOverrides,
  parseRuleSpec,
  Rule,
  RuleSpec,
} from '../rules';

import {firewallSpec} from '../specs';
import {createSimplifier, Simplifier} from '../setops';

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

export function convert(filename: string) {
  const idToItem = new Map<string, AnyAzureObject>();
  const idToAlias = new Map<string, string>();

  patchFirewallSpec();
  const universe = new Universe(firewallSpec);
  const simplifier: Simplifier<RuleSpec> = createSimplifier<RuleSpec>(universe);

  const text = fs.readFileSync(filename, 'utf8');
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

  //
  // Convert each VNet
  //

  for (const item of idToItem.values()) {
    console.log(`${item.name}: ${item.type}`);
    const vnet = asAzureVirtualNetwork(item);
    if (vnet) {
      convertVNet(vnet);
    }
  }

  console.log('done');

  function convertVNet(vnet: AzureVirtualNetwork) {
    const addresses = vnet.properties.addressSpace.addressPrefixes.join(', ');
    console.log(`  VNet: ${getAlias(vnet)}`);
    console.log(`    address prefixes: [${addresses}]`);
    universe.defineSymbol('destinationIp', vnet.name, addresses, true);
    for (const subnet of vnet.properties.subnets) {
      convertSubnet(vnet, subnet);
    }
  }
  
  function convertSubnet(vnet: AzureVirtualNetwork, subnet: AzureSubnet) {
    console.log(`    Subnet: ${getAlias(subnet)}`);
    console.log(`      addressPrefix: ${subnet.properties.addressPrefix}`);
    console.log(`      ipConfigurations:`);
    for (const ipConfig of subnet.properties.ipConfigurations) {
      convertIpConfiguration(dereference<AzureIPConfiguration>(ipConfig));
    }
    convertNSG(
      vnet,
      dereference<AzureNetworkSecurityGroup>(
        subnet.properties.networkSecurityGroup
      )
    );
  }

  function convertIpConfiguration(config: AzureIPConfiguration) {
    console.log(`        ${getAlias(config)} (${config.properties.privateIPAddress})`);
  }

  function convertNSG(
    vnet: AzureVirtualNetwork,
    nsg: AzureNetworkSecurityGroup
  ) {
    const inbound: Rule[] = [];
    const outbound: Rule[] = [];

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

    const x = denyOverrides(inbound, simplifier);
    console.log();
    console.log('        CONSOLIDATED INBOUND:');
    console.log(x.format({prefix: '          '}));

    const y = denyOverrides(outbound, simplifier);
    console.log();
    console.log('        CONSOLIDATED OUTBOUND:');
    console.log(y.format({prefix: '          '}));
  }

  function convertRule(
    vnet: AzureVirtualNetwork,
    rule: AzureSecurityRule
  ): Rule {
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
      source: filename,
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

    const r = parseRuleSpec(universe, spec);
    console.log(r.conjunction.format({prefix: '            '}));

    return r;
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

  // TODO: Replace the patchFirewallSpec() hack with a real Azure UniverseSpec.
  // May need some way to specify the ip addresses for the AzureLoadBalancer.
  // Consider a factory that generates the spec from a smaller temple with
  // values for tags.
  function patchFirewallSpec() {
    firewallSpec.types[0].values.push({
      symbol: 'Internet',
      range: '0.0.0.0-255.255.255.255',
    });
  
    firewallSpec.types[2].values.push({
      symbol: 'Tcp',
      range: '6',
    });

    firewallSpec.types[0].values.push({
      symbol: 'AzureLoadBalancer',
      // TODO: get real load-balancer ip address.
      // Random, made-up ip address for load balancer.
      range: '5.6.7.8',
    });
  }
}
