import {AnyAzureObject, IAzureConverter, ItemAlias} from '.';
import {IEntityStore, IRules} from '..';
import {NodeSpec} from '../..';

export abstract class BaseAzureConverter implements IAzureConverter {
  public readonly supportedType: string;

  protected constructor(supportedType: string) {
    this.supportedType = supportedType;
  }

  aliases(item: AnyAzureObject): ItemAlias[] {
    return [{item, alias: item.name}];
  }

  convert(
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    input: AnyAzureObject,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    store: IEntityStore<AnyAzureObject>
  ): NodeSpec[] {
    const empty: NodeSpec[] = [];
    return empty;
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  rules(input: AnyAzureObject, store: IEntityStore<AnyAzureObject>): IRules {
    return {
      outboundRules: [],
      inboundRules: [],
    };
  }
}
