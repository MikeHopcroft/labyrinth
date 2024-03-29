import {NodeSpec, RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';

import {
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzureReference,
  AzureVirtualMachine,
} from './azure_types';

import {NSGRuleSpecs} from './converters';
import {GraphServices} from './graph_services';

// TODO: Verify that all IpConfigs have same subnet

export function convertNIC(
  services: GraphServices,
  spec: AzureNetworkInterface,
  outboundNodeKey: string,
  vnetSymbol: string
): SimpleRoutingRuleSpec {
  services.nodes.markTypeAsUsed(spec);

  // NSG rules
  //
  const nsgRef = spec.properties.networkSecurityGroup;
  let nsgRules: NSGRuleSpecs = {
    inboundRules: [],
    outboundRules: [],
  };

  if (nsgRef) {
    const nsgSpec = services.index.dereference<AzureNetworkSecurityGroup>(
      nsgRef
    );
    nsgRules = services.convert.nsg(services, nsgSpec, vnetSymbol);
  }

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = services.nodes.createInboundKey(spec);
  const outboundKey = services.nodes.createOutboundKey(spec);

  // Route from VM to this NIC.
  const sourceIp = spec.properties.ipConfigurations
    .map(ip => ip.properties.privateIPAddress)
    .join(',');
  const routeFromVM: RoutingRuleSpec = {
    destination: outboundKey,
    constraints: {sourceIp},
  };

  const routeToVM = createVmRoute(
    services,
    routeFromVM,
    spec.properties.virtualMachine
  );

  //
  // Construct inbound node
  //
  const inboundNode: NodeSpec = {
    key: inboundKey,
    friendlyName: spec.name,
    internal: true,
    name: spec.id,
    routes: [routeToVM],
  };
  if (nsgRules.inboundRules.length) {
    inboundNode.filters = nsgRules.inboundRules;
  }
  services.nodes.add(inboundNode);

  const outboundNode: NodeSpec = {
    key: outboundKey,
    friendlyName: spec.name,
    internal: true,
    name: spec.id,
    routes: [{destination: outboundNodeKey}],
  };

  if (nsgRules.outboundRules.length) {
    outboundNode.filters = nsgRules.outboundRules;
  }
  services.nodes.add(outboundNode);

  //
  // Return route for use by parent node.
  //

  // DESIGN NOTE: it appears that Azure does not allow a NIC to include
  // IpConfigs bound to multiple subnets. If this assumption were wrong,
  // we would have to filter this map to include only private IPs for the
  // subnet parent of this NIC.
  return {
    destination: inboundKey,
    constraints: {destinationIp: sourceIp},
  };
}

function createVmRoute(
  services: GraphServices,
  routeFromVM: RoutingRuleSpec,
  vmRef?: AzureReference<AzureVirtualMachine>
): RoutingRuleSpec {
  // The NIC is not attached to a VM which means that it is not active
  // and cannot be routed to. In this case no valid route can be created.
  //
  // Three possible paths could be taken here. First, the code could throw.
  // Second, it could returned undefined. Finally, it could create a route
  // to an Unbound Node.
  //
  // The third option has been choosen as this provides the user with the
  // most relevant information and does not attempt to hide or obscure
  // the route.
  if (vmRef) {
    const vmSpec = services.index.dereference<AzureVirtualMachine>(vmRef);
    return services.convert.vm(services, vmSpec, routeFromVM);
  }

  return services.createUnboundNicAndReturnRoute();
}
