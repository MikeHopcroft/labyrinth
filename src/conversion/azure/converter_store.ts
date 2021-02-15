import {
  IAzureConverter,
  AnyAzureObject,
  parseMonikers,
  skipProcessingNodeSpecs,
} from '.';

const DefaultConverter = {
  supportedType: 'DefaultTypes',
  monikers: parseMonikers,
  convert: skipProcessingNodeSpecs,
} as IAzureConverter;

export class ConverterStore {
  private readonly converters: Map<string, IAzureConverter>;
  private readonly defaultConverter: IAzureConverter;

  constructor(converters: IterableIterator<IAzureConverter>) {
    this.converters = new Map<string, IAzureConverter>();
    this.defaultConverter = DefaultConverter;

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
