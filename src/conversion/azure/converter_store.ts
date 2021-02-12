import {
  BaseAzureConverter,
  IAzureConverter,
  AnyAzureObject,
  ItemAlias,
} from '.';

export class ConverterStore {
  private readonly converters: Map<string, IAzureConverter>;
  private readonly defaultConverter: IAzureConverter;

  constructor(...converters: IAzureConverter[]) {
    this.converters = new Map<string, IAzureConverter>();
    this.defaultConverter = new DefaultConverter();

    for (const converter of converters) {
      this.converters.set(converter.supportedType, converter);
    }
  }

  asConverter(input: AnyAzureObject): IAzureConverter {
    let converter = this.converters.get(input.type);

    if (!converter) {
      converter = this.defaultConverter;
    }

    return converter;
  }
}

class DefaultConverter extends BaseAzureConverter {
  constructor() {
    super('DefaultTypes*');
  }

  aliases(input: AnyAzureObject): ItemAlias[] {
    const aliases: ItemAlias[] = [];
    aliases.push({
      item: input,
      alias: '',
    });
    return aliases;
  }
}
