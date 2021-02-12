import {AnyAzureObject, IAzureConverter, ItemAlias} from '.';
import {IEntityStore, IRules} from '..';
import {NodeSpec} from '../..';

export abstract class BaseAzureConverter implements IAzureConverter {
  public readonly supportedType: string;

  protected constructor(supportedType: string) {
    this.supportedType = supportedType;
  }

  aliases(input: AnyAzureObject): ItemAlias[] {
    const aliases: ItemAlias[] = [];
    aliases.push({
      item: input,
      alias: input.name,
    });
    return aliases;
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
