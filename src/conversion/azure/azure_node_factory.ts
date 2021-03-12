import {
  AnyAzureObject,
  AzureObjectType,
  AzureTypedObject,
  IReleatedX,
  IAzureGraphNode,
  asSpec,
  AzureVirtualNetwork,
  AzureVirtualMachineScaleSet,
  AzureLocalIP,
  AzurePublicIp,
  AzureLoadBalancerFrontEndIp,
  AzureLoadBalancerBackendPool,
  AzureLoadBalancerInboundNatRule,
  AzureLoadBalancerRule,
  AzureLoadBalancer,
  AzureNetworkInterface,
  AzureNetworkSecurityGroup,
  AzureSubnet,
} from './types';
import * as Converter from './converters';
import {noOpMaterialize} from './convert_common';
import {normalizedNodeKey, normalizedSymbolKey} from './formatters';

function createDefaultNode(
  services: IReleatedX,
  spec: AnyAzureObject
): IAzureGraphNode {
  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    relatedSpecIds: () => {
      return [].values();
    },
    materialize: noOpMaterialize,
  };
}

export function createAzureNode(
  services: IReleatedX,
  azureType: AzureTypedObject
): IAzureGraphNode {
  const input = azureType as AnyAzureObject;
  const normalizedType = input.type.toLowerCase();
  switch (normalizedType) {
    case AzureObjectType.VIRTUAL_NETWORK:
      return Converter.createVirtualNetworkNode(
        services,
        asSpec<AzureVirtualNetwork>(input, AzureObjectType.VIRTUAL_NETWORK)
      );
    case AzureObjectType.SUBNET:
      return Converter.createSubnetNode(
        services,
        asSpec<AzureSubnet>(input, AzureObjectType.SUBNET)
      );
    case AzureObjectType.NSG:
      return Converter.createNetworkSecurityGroupNode(
        services,
        asSpec<AzureNetworkSecurityGroup>(input, AzureObjectType.NSG)
      );
    case AzureObjectType.NIC:
      return Converter.createNetworkInterfaceNode(
        services,
        asSpec<AzureNetworkInterface>(input, AzureObjectType.NIC)
      );
    case AzureObjectType.LOAD_BALANCER:
      return Converter.createLoadBalancerNode(
        services,
        asSpec<AzureLoadBalancer>(input, AzureObjectType.LOAD_BALANCER)
      );
    case AzureObjectType.LOAD_BALANCER_RULE:
      return Converter.createLoadBalancerRuleNode(
        services,
        asSpec<AzureLoadBalancerRule>(input, AzureObjectType.LOAD_BALANCER_RULE)
      );
    case AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND:
      return Converter.createLoadBalancerNatRuleNode(
        services,
        asSpec<AzureLoadBalancerInboundNatRule>(
          input,
          AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND
        )
      );
    case AzureObjectType.LOAD_BALANCER_BACKEND_POOL:
      return Converter.createLoadBalancerBackendPool(
        services,
        asSpec<AzureLoadBalancerBackendPool>(
          input,
          AzureObjectType.LOAD_BALANCER_BACKEND_POOL
        )
      );
    case AzureObjectType.LOAD_BALANCER_FRONT_END_IP:
      return Converter.createLoadBalancerFrontEndIpNode(
        services,
        asSpec<AzureLoadBalancerFrontEndIp>(
          input,
          AzureObjectType.LOAD_BALANCER_FRONT_END_IP
        )
      );
    case AzureObjectType.PUBLIC_IP:
      return Converter.createIpNode(
        services,
        asSpec<AzurePublicIp>(input, AzureObjectType.PUBLIC_IP)
      );
    case AzureObjectType.LOCAL_IP:
      return Converter.createIpNode(
        services,
        asSpec<AzureLocalIP>(input, AzureObjectType.LOCAL_IP)
      );
    case AzureObjectType.VMSS_VIRTUAL_IP:
      return Converter.createVMSSVirtualIpNode(services, input);
    case AzureObjectType.VMSS_VIRTUAL_NIC:
      return Converter.createVMSSVirtualIpNIC(services, input);
    case AzureObjectType.VIRTUAL_MACHINE_SCALE_SET:
      return Converter.createVirtualMachineScaleSetNode(
        services,
        asSpec<AzureVirtualMachineScaleSet>(
          input,
          AzureObjectType.VIRTUAL_MACHINE_SCALE_SET
        )
      );
    default:
      return createDefaultNode(services, input);
  }
}
