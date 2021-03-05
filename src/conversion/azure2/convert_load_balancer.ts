import {RoutingRuleSpec} from '../../graph';

import {
  AzureLoadBalancer,
  AzureLoadBalancerRule,
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerFrontEndIp,
} from './types';
import {GraphServices} from './graph_services';
import {NodeKeyAndSourceIp} from './converters';

// TODO: Move into constants
const AzureLoadBalancerSymbol = 'AzureLoadBalancer';

function createLoadBalancerRoute(
  frontEndIp: string,
  backEnd: NodeKeyAndSourceIp,
  protocol: string,
  frontEndPort: string,
  backendPort: string
) {
  const route: RoutingRuleSpec = {
    destination: backEnd.key,
    constraints: {
      destinationPort: frontEndPort,
      protocol: protocol,
      destinationIp: frontEndIp,
    },
    override: {
      destinationIp: backEnd.destinationIp,
      sourceIp: AzureLoadBalancerSymbol,
    },
  };

  if (backendPort !== frontEndPort) {
    route.override!.destinationPort = backendPort;
  }
  return route;
}

function createRuleRoute(
  lbRuleSpec: AzureLoadBalancerRule,
  services: GraphServices
): RoutingRuleSpec {
  const convert = services.convert;
  const store = services.index;
  const rule = lbRuleSpec.properties;

  const backend = convert.backendPool(
    services,
    store.dereference(rule.backendAddressPool)
  );

  const {destinationIp: frontEndIp} = convert.loadBalancerIp(
    services,
    store.dereference(rule.frontendIPConfiguration)
  );

  return createLoadBalancerRoute(
    frontEndIp,
    backend,
    rule.protocol,
    `${rule.frontendPort}`,
    `${rule.backendPort}`
  );
}

function createNATRoute(
  natRuleSpec: AzureLoadBalancerInboundNatRule,
  services: GraphServices
): RoutingRuleSpec | null {
  const convert = services.convert;
  const store = services.index;

  const rule = natRuleSpec.properties;

  const backEnd = convert.ip(services, rule.backendIPConfiguration);

  const {destinationIp: frontEndIp} = convert.loadBalancerIp(
    services,
    store.dereference(rule.frontendIPConfiguration)
  );

  return createLoadBalancerRoute(
    frontEndIp,
    backEnd,
    rule.protocol,
    `${rule.frontendPort}`,
    `${rule.backendPort}`
  );
}

export function convertLoadBalancer(
  services: GraphServices,
  loadBalancerSpec: AzureLoadBalancer
): NodeKeyAndSourceIp {
  const loadBalancerNodeKey = loadBalancerSpec.id;
  const loadBalancerServiceTag = loadBalancerSpec.id;

  const routes: RoutingRuleSpec[] = [];
  const frontEndIps = new Set<string>();

  // TODO: Review Pool vs Route
  for (const lbRuleSpec of loadBalancerSpec.properties.loadBalancingRules) {
    const route = createRuleRoute(lbRuleSpec, services);
    routes.push(route);
    if (route?.constraints?.destinationIp) {
      frontEndIps.add(route.constraints.destinationIp);
    }
  }

  for (const natRuleSpec of loadBalancerSpec.properties.inboundNatRules) {
    const route = createNATRoute(natRuleSpec, services);
    if (route) {
      routes.push(route);
      if (route?.constraints?.destinationIp) {
        frontEndIps.add(route.constraints.destinationIp);
      }
    }
  }

  if (frontEndIps.size > 0) {
    // TODO: Create using empty set if 0 or use except *
    services.symbols.defineServiceTag(
      loadBalancerServiceTag,
      [...frontEndIps.values()].join(',')
    );
  }

  services.addNode({
    key: loadBalancerNodeKey,
    routes,
  });

  return {key: loadBalancerNodeKey, destinationIp: loadBalancerServiceTag};
}

export function convertLoadBalancerIp(
  services: GraphServices,
  loadBalancerIpSpec: AzureLoadBalancerFrontEndIp
): NodeKeyAndSourceIp {
  const ipConfigSpec = services.index.dereference(
    loadBalancerIpSpec.properties.publicIPAddress
  );
  return services.convert.ip(services, ipConfigSpec);
}

export function convertBackendPool(
  services: GraphServices,
  backendPoolSpec: AzureLoadBalancerBackendPool
): NodeKeyAndSourceIp {
  // TODO: Key should be subnet/inbound
  // TODO: Destination ip should be observed IP or obtained ip
  return {key: 'INVALID - Backend Subnet', destinationIp: backendPoolSpec.name};
}
