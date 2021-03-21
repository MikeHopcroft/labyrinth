import {IConverters} from './converters';
import {convertIp} from './convert_ip';
import {convertLoadBalancerFrontEndIp} from './convert_load_balancer';
import {convertNIC} from './convert_nic';
import {convertNSG} from './convert_nsg';
import {convertPublicIp} from './convert_public_ip';
import {convertResourceGraph} from './convert_resource_graph';
import {convertSubnet} from './convert_subnet';
import {convertVM} from './convert_vm';
import {convertVNet} from './convert_vnet';

export function defaultConverters(): IConverters {
  return {
    loadBalancerFrontend: convertLoadBalancerFrontEndIp,
    nic: convertNIC,
    resourceGraph: convertResourceGraph,
    subnet: convertSubnet,
    vnet: convertVNet,
    nsg: convertNSG,
    ip: convertIp,
    publicIp: convertPublicIp,
    vm: convertVM,
  };
}
