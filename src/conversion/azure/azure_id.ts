import {AzureObjectBase} from './azure_types';

// DESIGN NOTE: Azure Resource IDs
// Azure resource ids appear to use the following format
//
// Prefix
// /subscriptions/{sub id}/resourceGroups/{resource group name}
//       1            2          3                  4
//
// TopLevelItem
// {Prefix}/providers/{provider}/{type}/{resource name}
//             5          6         7          8
//
// Sub Resource Items
// Level 1
//   {Top Level Item}/{item type}/{name}
//                     9          10
// Level 2
//   {Level 1}/{item type}/{name}
//                11         12
// Level 3
//   {Level 2}/{item type}/{name}
//                13         14
//
// Example Level 3 Id
// /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/vnet/providers/Microsoft.Compute/virtualMachineScaleSets/vmss/virtualMachines/0/networkInterfaces/nic01/ipConfigurations/ipconfig01

export interface AzureId extends AzureObjectBase {
  readonly subscriptionId: string;
  readonly provider: string;
  readonly type: string;
  readonly resourceName: string;
  readonly subResource?: AzureSubResource;
  readonly subResource2?: AzureSubResource;
  readonly subResource3?: AzureSubResource;
}

export function parseAzureId(idRef: AzureObjectBase): AzureId {
  const parts = idRef.id.split('/');

  if (parts.length < 9) {
    throw new TypeError(`Invalid Azure Resource Id ${idRef.id}`);
  }

  return {
    id: idRef.id,
    subscriptionId: parts[2],
    resourceGroup: parts[4],
    provider: parts[6],
    type: parts[7],
    resourceName: parts[8],
    subResource: asSubResource(parts, 9),
    subResource2: asSubResource(parts, 11),
    subResource3: asSubResource(parts, 13),
  };
}

export function asRootId(id: AzureId): AzureObjectBase {
  return {
    id: [
      '/subscriptions',
      id.subscriptionId,
      'resourcegroups',
      id.resourceGroup,
      'providers',
      id.provider,
      id.type,
      id.resourceName,
    ].join('/'),
    resourceGroup: id.resourceGroup,
  };
}

export interface AzureSubResource {
  readonly type: string;
  readonly name: string;
}

function asSubResource(
  parts: string[],
  index: number
): AzureSubResource | undefined {
  if (parts.length < index) {
    return undefined;
  }

  return {
    type: parts[index],
    name: parts[index + 1],
  };
}
