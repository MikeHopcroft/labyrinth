import {
  BaseAzureConverter,
  IAzureConverter,
  AnyAzureObject,
  ItemMoniker,
} from '.';

export class ConverterStore {
  private readonly converters: Map<string, IAzureConverter>;
  private readonly defaultConverter: IAzureConverter;

  constructor(converters: IterableIterator<IAzureConverter>) {
    this.converters = new Map<string, IAzureConverter>();
    this.defaultConverter = new DefaultConverter();

    for (const converter of converters) {
      this.converters.set(converter.supportedType, converter);
    }
  }

  asConverter(input: AnyAzureObject): IAzureConverter {
    return this.converters.get(input.type) ?? this.defaultConverter;
  }

  static create(...converters: IAzureConverter[]) {
    return new ConverterStore(converters.values());
  }
}

class DefaultConverter extends BaseAzureConverter {
  constructor() {
    super('DefaultTypes*');
  }

  monikers(input: AnyAzureObject): ItemMoniker[] {
    const monikers: ItemMoniker[] = [];
    monikers.push({
      item: input,
      alias: '',
    });
    return monikers;
  }
}
