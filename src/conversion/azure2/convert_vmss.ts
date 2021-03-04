import {NodeSpec} from '../../graph';
import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';
import {AzureVirtualMachineScaleSet} from './types';

export function convertVmssIp(
  services: GraphServices,
  vmssSpec: AzureVirtualMachineScaleSet,
  networkInterface: string,
  ipConfig: string
): NodeKeyAndSourceIp {
  const networkConfig = vmssSpec.properties.virtualMachineProfile.networkProfile.networkInterfaceConfigurations.find(
    input => input.name === networkInterface
  );

  if (!networkConfig) {
    throw new TypeError(
      `Incomplete graph. Unable to locate VMSS '${vmssSpec.id}' with interface config '${networkInterface}'`
    );
  }

  const ipconfigSpec = networkConfig.properties.ipConfigurations.find(
    input => input.name === ipConfig
  );

  if (!ipconfigSpec) {
    throw new TypeError(
      `Incomplete graph. Unable to locate VMSS '${vmssSpec.id}' with ip config '${ipConfig}'`
    );
  }

  // TODO: Process NSG rules
  const vmssIpNode: NodeSpec = {
    key: `${vmssSpec.id}/${networkInterface}/${ipConfig}`,
    filters: [],
    routes: [
      {
        destination: 'Internet',
      },
    ],
  };
  services.addNode(vmssIpNode);
  return {key: vmssIpNode.key, destinationIp: 'INVALID'};
}
