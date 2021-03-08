import {hash} from '../../utilities/hash';
import {AzureReference, AzureSubnet, SubnetKeys} from './types';

export function normalizedSymbolKey(input: string): string {
  const normalizedInput = input.toLowerCase();
  const parts = normalizedInput.split(/[/]/).reverse();
  const head = parts.slice(0, 2).join('_');
  const signature = hash(normalizedInput).slice(0, 6);
  return [head, 'ServiceTag', signature].join('_').split(/[*/-]/).join('_');
}

export function normalizedNodeKey(input: string): string {
  const normalizedInput = input.toLowerCase();
  return normalizedInput.split('/').slice(6).reverse().join('/');
}

export function subnetKeys(input: AzureReference<AzureSubnet>): SubnetKeys {
  // Our convention is to use the Azure id as the Labyrinth NodeSpec key.
  const prefix = normalizedNodeKey(input.id);

  // TODO: come up with safer naming scheme. Want to avoid collisions
  // with other names.
  const inbound = prefix + '/inbound';
  const outbound = prefix + '/outbound';

  return {prefix, inbound, outbound};
}
