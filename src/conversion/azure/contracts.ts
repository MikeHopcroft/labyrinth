import {NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {AnyAzureObject} from '.';

export interface ItemMoniker {
  readonly item: AnyAzureObject | undefined;
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
