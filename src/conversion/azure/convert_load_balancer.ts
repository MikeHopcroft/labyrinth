import {Graph, PoolRuleSpec, RoutingRuleSpec} from '../../graph';

import {
  AzureLoadBalancer,
  AzureLoadBalancerRule,
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerFrontEndIp,
  AzureObjectType,
  AzureObjectBase,
} from './types';
import {GraphServices} from './graph_services';
import {NodeKeyAndSourceIp} from './converters';
import {AzureGraphNode} from './azure_graph_node';
import {IpNode} from './convert_ip';
import {SubnetNode} from './convert_subnet';
import {VMSSVirtualIpNode} from './convert_vmss';

// TODO: Move into constants
const AzureLoadBalancerSymbol = 'AzureLoadBalancer';

export class LoadBalancerFrontEndIpNode extends AzureGraphNode<
  AzureLoadBalancerFrontEndIp
> {
  constructor(input: AzureLoadBalancerFrontEndIp) {
    super(input.type as AzureObjectType, input);
  }

  *edges(): IterableIterator<string> {
    yield this.value.properties.publicIPAddress.id;
  }

  ip(): IpNode {
    return this.first<IpNode>(AzureObjectType.PUBLIC_IP);
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    throw new Error('Method not implemented.');
  }
}

export class LoadBalancerBackEndPoolNode extends AzureGraphNode<
  AzureLoadBalancerBackendPool
> {
  constructor(input: AzureLoadBalancerBackendPool) {
    super(input.type as AzureObjectType, input);
  }

  *edges(): IterableIterator<string> {
    for (const backend of this.value.properties.backendIPConfigurations) {
      yield backend.id;
    }
  }

  subnet(): SubnetNode {
    let subnet = this.firstOrDefault<IpNode>(
      AzureObjectType.LOCAL_IP
    )?.subnet();

    if (!subnet) {
      const vmssIp = this.first<VMSSVirtualIpNode>(
        AzureObjectType.VMSS_VIRTUAL_IP
      );
      subnet = vmssIp.subnet();
    }

    return subnet;
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    return {key: this.value.id, destinationIp: this.value.id};
  }
}

export class LoadBalancerRuleNode extends AzureGraphNode<
  AzureLoadBalancerRule
> {
  constructor(input: AzureLoadBalancerRule) {
    super(input.type as AzureObjectType, input);
  }

  *edges(): IterableIterator<string> {
    yield this.value.properties.frontendIPConfiguration.id;
    yield this.value.properties.backendAddressPool.id;
  }

  frontEndIp(): LoadBalancerFrontEndIpNode {
    return this.first<LoadBalancerFrontEndIpNode>(
      AzureObjectType.LOAD_BALANCER_FRONT_END_IP
    );
  }

  backendPool(): LoadBalancerBackEndPoolNode {
    return this.first<LoadBalancerBackEndPoolNode>(
      AzureObjectType.LOAD_BALANCER_BACKEND_POOL
    );
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    throw new Error('Method not implemented.');
  }

  convertToRoute(services: GraphServices): RoutingRuleSpec {
    const rule = this.value.properties;

    const frontEndIp = this.frontEndIp().ip().ipAddress();
    const backEndPool = this.backendPool();

    // TODO: Handle pool. . .
    const ruleSpec: RoutingRuleSpec = {
      destination: backEndPool.subnet().convert(services).key,
      constraints: {
        destinationPort: `${rule.frontendPort}`,
        protocol: rule.protocol,
        destinationIp: frontEndIp,
      },
      override: {
        destinationIp: backEndPool.convert(services).destinationIp,
        sourceIp: AzureLoadBalancerSymbol,
      },
    };

    if (rule.backendPort !== rule.frontendPort) {
      ruleSpec.override!.destinationPort = `${rule.backendPort}`;
    }

    return ruleSpec;
  }
}

export class LoadBalancerNatRuleNode extends AzureGraphNode<
  AzureLoadBalancerInboundNatRule
> {
  constructor(input: AzureLoadBalancerInboundNatRule) {
    super(input.type as AzureObjectType, input);
  }

  *edges(): IterableIterator<string> {
    yield this.value.properties.frontendIPConfiguration.id;
    yield this.value.properties.backendIPConfiguration.id;
  }

  frontEndIp(): LoadBalancerFrontEndIpNode {
    return this.first<LoadBalancerFrontEndIpNode>(
      AzureObjectType.LOAD_BALANCER_FRONT_END_IP
    );
  }

  backEnd(): IpNode {
    return this.first<IpNode>(AzureObjectType.LOCAL_IP);
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    throw new Error('Method not implemented.');
  }

  convertToRoute(services: GraphServices): RoutingRuleSpec {
    const rule = this.value.properties;

    const backEnd = this.backEnd().convert(services);

    const frontEndIp = this.frontEndIp().ip().ipAddress();

    const ruleSpec: RoutingRuleSpec = {
      destination: backEnd.key,
      constraints: {
        destinationPort: `${rule.frontendPort}`,
        protocol: rule.protocol,
        destinationIp: frontEndIp,
      },
      override: {
        destinationIp: backEnd.destinationIp,
        sourceIp: AzureLoadBalancerSymbol,
      },
    };

    if (rule.backendPort !== rule.frontendPort) {
      ruleSpec.override!.destinationPort = `${rule.backendPort}`;
    }

    return ruleSpec;
  }
}

export class LoadBalancerNode extends AzureGraphNode<AzureLoadBalancer> {
  constructor(input: AzureLoadBalancer) {
    super(input.type as AzureObjectType, input);
  }

  *edges(): IterableIterator<string> {
    for (const rule of this.value.properties.loadBalancingRules) {
      yield rule.id;
    }

    for (const rule of this.value.properties.inboundNatRules) {
      yield rule.id;
    }
  }

  balancingRules(): IterableIterator<LoadBalancerRuleNode> {
    return this.typedEdges<LoadBalancerRuleNode>(
      AzureObjectType.LOAD_BALANCER_RULE
    );
  }

  natRule(): IterableIterator<LoadBalancerNatRuleNode> {
    return this.typedEdges<LoadBalancerNatRuleNode>(
      AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND
    );
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    const loadBalancerNodeKey = this.value.id;
    const loadBalancerServiceTag = this.value.id;

    const routes: RoutingRuleSpec[] = [];
    const frontEndIps = new Set<string>();

    for (const lbRule of this.balancingRules()) {
      routes.push(lbRule.convertToRoute(services));
      frontEndIps.add(lbRule.frontEndIp().ip().ipAddress());
    }

    for (const natRule of this.balancingRules()) {
      routes.push(natRule.convertToRoute(services));
      frontEndIps.add(natRule.frontEndIp().ip().ipAddress());
    }

    services.symbols.defineServiceTag(
      loadBalancerServiceTag,
      [...frontEndIps.values()].join(',')
    );

    services.addNode({
      key: loadBalancerNodeKey,
      routes,
    });

    return {key: loadBalancerNodeKey, destinationIp: loadBalancerServiceTag};
  }
}
