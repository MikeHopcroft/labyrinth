import {NodeSpec} from '../../graph';

import {IEntityStore} from '..';

import {AnyAzureObject} from '.';

export interface ItemMoniker {
  readonly item: AnyAzureObject | undefined;
  readonly alias: string;
}

export interface IAzureConverter {
  readonly supportedType: string;
  monikers(input: AnyAzureObject): ItemMoniker[];
  convert(
    input: AnyAzureObject,
    stores: IEntityStore<AnyAzureObject>
  ): NodeSpec[];
}
