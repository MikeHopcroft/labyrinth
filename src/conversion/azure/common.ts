import {NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {AnyAzureObject} from '.';

export interface ItemMoniker {
  readonly item: AnyAzureObject;
  readonly name: string;
}

// DESIGN NOTE: Both monikers and convert return an array or list
// of items as it is possible that a top level item in the Azure
// graph consists of internal elements which may be referenced by
// other items in teh graph. An example of this could be network
// interface card on a Virutal Machine in a scale set
export interface IAzureConverter<T extends AnyAzureObject> {
  readonly supportedType: string;
  monikers(input: T): ItemMoniker[];
  convert(input: T, stores: IEntityStore<AnyAzureObject>): NodeSpec[];
}

export function extractMonikers(item: AnyAzureObject): ItemMoniker[] {
  return [{item, name: item.name}];
}

// DESIGN NOTE: Skip processsing NodeSpecs exists for items which
// need to be indexed as their data is used by other elements
// however these types do not make sense to be converted indpendently
function skipProcessingNodeSpecs(
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  input: AnyAzureObject,
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  store: IEntityStore<AnyAzureObject>
): NodeSpec[] {
  const empty: NodeSpec[] = [];
  return empty;
}

export const DefaultConverter: IAzureConverter<AnyAzureObject> = {
  supportedType: 'DefaultTypes',
  monikers: extractMonikers,
  convert: skipProcessingNodeSpecs,
};
