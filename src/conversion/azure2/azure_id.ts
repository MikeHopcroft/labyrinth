import {number} from 'io-ts';
import {AzureReference} from '../azure/types';
import {AzureIdReference, AzureVirtualMachineScaleSet} from './types';

export interface AzureVMSSIpResult {
  vmssId: AzureReference<AzureVirtualMachineScaleSet>;
  interfaceConfig: string;
  ipConfig: string;
  logicalId: number;
}

function splitId(input: string): string[] {
  return input.split('/');
}

export class AzureId {
  // In the case of Load Balancers which are using VMSS there are references which
  // do not contain direct items in the graph. This parsing function extracts the
  // separates the id which then can be used to look up necessary downstream items
  static parseAsVMSSIpConfiguration(
    input: AzureIdReference
  ): AzureVMSSIpResult {
    const parts = splitId(input.id);

    if (parts.length !== 15) {
      throw new TypeError(`Invalid VMSS IP Configuration Id '${input.id}'`);
    }

    return {
      vmssId: {
        id: parts.slice(0, 9).join('/'),
        resourceGroup: input.resourceGroup,
      },
      logicalId: Number.parseInt(parts[10]),
      interfaceConfig: parts[12],
      ipConfig: parts[14],
    };
  }

  static parseResourceHostId(input: AzureIdReference): string {
    const parts = splitId(input.id);
    return parts.slice(0, parts.length - 2).join('/');
  }
}
