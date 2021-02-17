import {
  IAzureConverter,
  AnyAzureObject,
  parseMonikers,
  skipProcessingNodeSpecs,
} from '.';

const DefaultConverter: IAzureConverter<AnyAzureObject> = {
  supportedType: 'DefaultTypes',
  monikers: parseMonikers,
  convert: skipProcessingNodeSpecs,
};

export class ConverterStore<T extends AnyAzureObject> {
  private readonly converters: Map<string, IAzureConverter<T>>;
  private readonly defaultConverter: IAzureConverter<T>;

  constructor(converters: IterableIterator<IAzureConverter<T>>) {
    this.converters = new Map<string, IAzureConverter<T>>();
    this.defaultConverter = DefaultConverter;

    for (const converter of converters) {
      const key = converter.supportedType;

      if (this.converters.has(key)) {
        throw new TypeError(`Duplicate converter registered for type '${key}'`);
      }

      this.converters.set(key, converter);
    }
  }

  asConverter(input: T): IAzureConverter<T> {
    return this.converters.get(input.type) ?? this.defaultConverter;
  }

  static create<T extends AnyAzureObject>(...converters: IAzureConverter<T>[]) {
    return new ConverterStore<T>(converters.values());
  }
}
