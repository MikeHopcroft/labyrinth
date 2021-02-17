import {AnyAzureObject} from '.';
import {IEntityStore, IRules} from '..';
import {NodeSpec} from '../..';

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
  rules(input: AnyAzureObject, store: IEntityStore<AnyAzureObject>): IRules;
}
