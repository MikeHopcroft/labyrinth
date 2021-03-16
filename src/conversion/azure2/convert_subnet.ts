import {NodeSpec, RoutingRuleSpec} from '../../graph';

import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';
import {
  AzureSubnet,
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
} from './types';

export function convertSubnet(
  services: GraphServices,
  subnetSpec: AzureSubnet,
  vNetKey: string
): NodeKeyAndSourceIp {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const subnetKeyPrefix = subnetSpec.id;
  const subnetServiceTag = subnetSpec.id;

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = subnetKeyPrefix + '/inbound';
  const outboundKey = subnetKeyPrefix + '/outbound';
  const routerKey = subnetKeyPrefix + '/router';

  const sourceIp = subnetSpec.properties.addressPrefix;
  services.symbols.defineServiceTag(subnetServiceTag, sourceIp);

  const routes: RoutingRuleSpec[] = [
    // Traffic leaving subnet
    {
      destination: outboundKey,
      constraints: {
        destinationIp: `except ${subnetSpec.properties.addressPrefix}`,
      },
    },
  ];

  // Materialize ip configurations and add routes.
  for (const nic of services.index
    .for(subnetSpec)
    .withType(AzureNetworkInterface)) {
    for (const ipConfigSpec of nic.properties.ipConfigurations) {
      routes.push(services.convert.ip(services, ipConfigSpec));
    }
  }

  const routerNode: NodeSpec = {
    key: routerKey,
    // TODO: do we want range here?
    range: {sourceIp},
    routes,
  };
  services.addNode(routerNode);

  const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
    subnetSpec.properties.networkSecurityGroup
  );
  const nsgRules = services.convert.nsg(nsgSpec, vNetKey);

  const inboundNode: NodeSpec = {
    key: inboundKey,
    filters: nsgRules.inboundRules,
    // TODO: do we want range here?
    // TODO: is this correct? The router moves packets in both directions.
    routes: [
      {
        destination: routerKey,
      },
    ],
  };
  services.addNode(inboundNode);

  const outboundNode: NodeSpec = {
    key: outboundKey,
    filters: nsgRules.outboundRules,
    routes: [
      {
        destination: vNetKey,
      },
    ],
  };
  services.addNode(outboundNode);

  // TODO: What should be returned here? Subnet is represetned by 3 nodes...
  return {
    key: inboundNode.key,
    destinationIp: subnetSpec.properties.addressPrefix,
  };
}

// interface IRules {
//   readonly outboundRules: RuleSpec[];
//   readonly inboundRules: RuleSpec[];
// }

// function convertNsgRules(
//   nsgRef: AzureReference<AzureNetworkSecurityGroup>,
//   services: GraphServices,
//   vNetKey: string
// ): IRules | undefined {
//   if (nsgRef) {
//     const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
//       nsgRef
//     );

//     // FIX: vNetKey needs to be a symbol not just a node key
//     return services.convert.nsg(services, nsgSpec, vNetKey);
//   }

//   return undefined;
// }
