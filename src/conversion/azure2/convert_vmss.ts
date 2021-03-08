import {AzureGraphNode} from './azure_graph_node';
import {AzureId, AzureVMSSIpResult} from './azure_id';
import {NodeKeyAndSourceIp} from './converters';
import {SubnetNode} from './convert_subnet';
import {GraphServices} from './graph_services';
import {AzureObjectType, AzureTypedObject, AzureVirtualMachineScaleSet} from './types';

export class VirtualMachineScaleSetNode extends AzureGraphNode<
  AzureVirtualMachineScaleSet
> {
  constructor(input: AzureVirtualMachineScaleSet) {
    super(AzureObjectType.VIRTUAL_MACHINE_SCALE_SET, input);
  }

  *edges(): IterableIterator<string> {
    for (const netConfig of this.value.properties.virtualMachineProfile
      .networkProfile.networkInterfaceConfigurations) {
      for (const ipconfig of netConfig.properties.ipConfigurations) {
        yield ipconfig.properties.subnet.id;
      }
    }
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    throw new Error('Method not implemented.');
  }

  getSubnet(vmssIds: AzureVMSSIpResult): SubnetNode {
    const vmssSpec = this.value;

    const networkConfig = vmssSpec.properties.virtualMachineProfile.networkProfile.networkInterfaceConfigurations.find(
      input => input.name.toLowerCase() === vmssIds.interfaceConfig
    );

    if (!networkConfig) {
      throw new TypeError(
        `Incomplete graph. Unable to locate VMSS '${vmssSpec.id}' with interface config '${vmssIds.interfaceConfig}'`
      );
    }

    const ipconfigSpec = networkConfig.properties.ipConfigurations.find(
      input => input.name.toLowerCase() === vmssIds.ipConfig
    );

    if (!ipconfigSpec) {
      throw new TypeError(
        `Incomplete graph. Unable to locate VMSS '${vmssSpec.id}' with ip config '${vmssIds.ipConfig}'`
      );
    }

    const subnetNode = this.nodes.find(
      x => x.key === ipconfigSpec.properties.subnet.id.toLowerCase()
    );

    return subnetNode as SubnetNode;
  }
}

export class VMSSVirtualIpNode extends AzureGraphNode<AzureTypedObject> {
  private readonly vmssId: AzureVMSSIpResult;

  constructor(input: AzureTypedObject) {
    super(AzureObjectType.VMSS_VIRTUAL_IP, input);
    this.vmssId = AzureId.parseAsVMSSIpConfiguration(input);
  }

  *edges(): IterableIterator<string> {
    yield this.vmssId.vmssId.id;
  }

  protected convertNode(services: GraphServices): NodeKeyAndSourceIp {
    return {key: this.nodeKey(), destinationIp: this.ipAddress()};
  }

  public ipAddress(): string {
    return 'VMSS-VIRTUAL-IP';
  }

  subnet(): SubnetNode {
    return this.virtualMachineScaleSet().getSubnet(this.vmssId);
  }

  private virtualMachineScaleSet(): VirtualMachineScaleSetNode {
    return this.first<VirtualMachineScaleSetNode>(
      AzureObjectType.VIRTUAL_MACHINE_SCALE_SET
    );
  }

  private nodeKey(): string {
    throw new Error('Failed');
  }
}
