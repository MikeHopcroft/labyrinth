import {NodeSpec} from '../../graph';

import {IEntityStore, ItemMoniker} from '..';

import {AnyAzureObject} from '../azure';

export function parseMonikers(item: AnyAzureObject): ItemMoniker[] {
  return [{item, alias: item.name}];
}

export function skipProcessingNodeSpecs(
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  input: AnyAzureObject,
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const empty: NodeSpec[] = [];
  return empty;
}
