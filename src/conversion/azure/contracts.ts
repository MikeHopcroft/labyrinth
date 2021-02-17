import {NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {AnyAzureObject} from '.';

export interface ItemMoniker {
  readonly item: AnyAzureObject | undefined;
  readonly alias: string;
}

export interface IAzureConverter<T extends AnyAzureObject> {
  readonly supportedType: string;
  monikers(input: T): ItemMoniker[];
  convert(input: T, stores: IEntityStore<AnyAzureObject>): NodeSpec[];
}
