import {NodeSpec, RoutingRuleSpec, SimpleRoutingRuleSpec} from '../../graph';

import {
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzureVirtualMachine,
} from './azure_types';

import {NSGRuleSpecs} from './converters';
import {GraphServices} from './graph_services';

// TODO: Verify that all IpConfigs have same subnet

export function convertNIC(
  services: GraphServices,
  spec: AzureNetworkInterface,
  parent: string,
  vnetSymbol: string
): SimpleRoutingRuleSpec {
  if (!spec.properties.virtualMachine) {
    // The NIC is not attached to a VM which means that it is not active
    // and cannot be routed to. In this case no NIC should be added
    throw new TypeError('NIC without VM are not supported');
  }

  const keyPrefix = services.nodes.createKey(spec);

  //
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
    nsgRules = services.convert.nsg(nsgSpec, vnetSymbol);
  }

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inboundKey = services.nodes.createKeyVariant(keyPrefix, 'inbound');
  const outboundKey = services.nodes.createKeyVariant(keyPrefix, 'outbound');

  // Route from VM to this NIC.
  const sourceIp = spec.properties.ipConfigurations
    .map(ip => ip.properties.privateIPAddress)
    .join(',');
  const routeFromVM: RoutingRuleSpec = {
    destination: outboundKey,
    constraints: {sourceIp},
  };

  // Materialize the VM.
  const vmSpec = services.index.dereference<AzureVirtualMachine>(
    spec.properties.virtualMachine
  );
  const routeToVM = services.convert.vm(services, vmSpec, routeFromVM);

  //
  // Construct inbound node
  //
  const inboundNode: NodeSpec = {
    key: inboundKey,
    name: spec.id + '/inbound',
    routes: [routeToVM],
  };
  if (nsgRules.inboundRules.length) {
    inboundNode.filters = nsgRules.inboundRules;
  }
  services.nodes.add(inboundNode);

  const outboundNode: NodeSpec = {
    key: outboundKey,
    name: spec.id + '/outbound',
    routes: [{destination: parent}],
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
