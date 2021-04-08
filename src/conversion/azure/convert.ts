import {GraphSpec} from '../../graph';

import {isValidVMSSIpConfigId, isValidVMSSIpNic} from './azure_id';
import {AzureObjectIndex} from './azure_object_index';
import {
  AnyAzureObject,
  AnyIpConfiguration,
  AzureLoadBalancer,
  AzureLoadBalancerBackendPool,
  AzureNetworkInterface,
  AzureObjectBase,
  AzureObjectType,
  AzurePrivateIP,
  AzurePublicIP,
  AzureResourceGraph,
  AzureSubnet,
} from './azure_types';
import {createVmssIpSpec, createVmssNetworkIntefaceSpec} from './convert_vmss';
import {GraphServices} from './graph_services';
import {normalizeCase} from './normalize_case';
import {SymbolTable} from './symbol_table';
import {unusedTypes} from './unused_types';
import {walkAzureObjectBases} from './walk';

export interface ConversionResults {
  graph: GraphSpec;
  unusedTypes: Map<string, Set<string>>;
}

export function convert(
  resourceGraphSpec: AzureResourceGraph
): ConversionResults {
  //
  // Normalize casing in Azure Resource Graph type fields.
  //
  normalizeCase(resourceGraphSpec);

  //
  // Initialize GraphServices
  //
  const symbols = new SymbolTable([
    {
      dimension: 'ip',
      symbol: 'AzureLoadBalancer',
      range: '168.63.129.16',
    },
    {
      dimension: 'protocol',
      symbol: 'Udp',
      range: 'udp',
    },
    {
      dimension: 'protocol',
      symbol: 'UDP',
      range: 'udp',
    },
    {
      dimension: 'protocol',
      symbol: 'Tcp',
      range: 'tcp',
    },
    {
      dimension: 'protocol',
      symbol: 'TCP',
      range: 'tcp',
    },
  ]);
  const index = new AzureObjectIndex(resourceGraphSpec);
  const services = new GraphServices(index, {symbols});

  //
  // Initialize references
  //
  for (const nic of services.index.withType(AzureNetworkInterface)) {
    for (const ipConfig of nic.properties.ipConfigurations) {
      const subnet = ipConfig.properties.subnet;
      if (subnet) {
        const subnetSpec = services.index.dereference<AzureSubnet>(subnet);
        services.index.addReference(nic, subnet);
        services.index.allocator.registerSubnet(
          subnetSpec.id,
          subnetSpec.properties.addressPrefix
        );
        services.index.allocator.reserve(
          subnet.id,
          ipConfig.id,
          ipConfig.properties.privateIPAddress
        );
      }
    }
  }

  // Hydrate synthetic types such as Virtual Machine Scale Set NICs
  for (const ref of walkAzureObjectBases(resourceGraphSpec)) {
    if (index.has(ref.id)) {
      continue;
    }

    realizeIfSynthetic(ref, index);
  }

  // Setup references between public ips and their vnets
  for (const publicIp of services.index.withType(AzurePublicIP)) {
    if (publicIp.properties.ipConfiguration) {
      const ipConfig = services.index.dereference<AnyIpConfiguration>(
        publicIp.properties.ipConfiguration
      );

      if (ipConfig.type !== AzureObjectType.PUBLIC_IP) {
        if (ipConfig.properties.subnet) {
          const vnet = services.index.getParentId(ipConfig.properties.subnet);
          services.index.addReference(publicIp, vnet);
        }
      }
    }
  }

  // Setup references between Load Balancers and their Subnet
  for (const lbSpec of index.withType(AzureLoadBalancer)) {
    const poolRef = lbSpec.properties?.backendAddressPools[0];

    if (poolRef) {
      const pool = index.dereference<AzureLoadBalancerBackendPool>(poolRef);
      const ipRef = pool.properties?.backendIPConfigurations[0];

      if (ipRef) {
        const ipConfig = index.dereference<AzurePrivateIP>(ipRef);
        const vnetId = index.getParentId(ipConfig.properties.subnet);

        services.index.addReference(lbSpec, vnetId);

        // There can be a case where load balancer has multiple IPs, but not
        // all are actively bound. In this case the graph ends up with what
        // appears to be broken routes. This walk will ensure that public ips
        // associated with a load balancer all route correctly. It's also like
        // that an ip in this state will result in 1 or more unbound rules
        for (const ip of lbSpec.properties.frontendIPConfigurations.map(
          x => x.properties.publicIPAddress
        )) {
          if (ip) {
            const publicIp = index.dereference<AzurePublicIP>(ip);
            services.index.addReference(publicIp, vnetId);
          }
        }
      }
    }
  }

  //
  // Convert the AzureResourceGraph to a Labyrinth graph.
  //
  services.convert.resourceGraph(services);

  // Emit the GraphSpec
  const graph = services.getLabyrinthGraphSpec();

  return {
    graph,
    unusedTypes: unusedTypes(services, resourceGraphSpec),
  };
}

function realizeIfSynthetic(
  ref: AzureObjectBase,
  index: AzureObjectIndex
): AnyAzureObject | undefined {
  if (isValidVMSSIpConfigId(ref.id)) {
    const nic = index.getParentId(ref);
    createVmssNetworkIntefaceSpec(nic, index);
    return createVmssIpSpec(ref, index);
  } else if (isValidVMSSIpNic(ref.id)) {
    return createVmssNetworkIntefaceSpec(ref, index);
  }

  return undefined;
}
