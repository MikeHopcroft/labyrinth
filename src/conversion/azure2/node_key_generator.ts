import {AzureTypedObject, azureTypeNames} from './azure_types';

export class NodeKeyGenerator {
  private readonly typeToPrefixAndCounter = new Map<
    string,
    {prefix: string; counter: number}
  >();

  constructor() {
    for (const [type, prefix] of azureTypeNames) {
      // if (type === '') {
      //   throw new TypeError('azureTypeNames may not use empty string for type name.');
      // }
      this.typeToPrefixAndCounter.set(type, {prefix, counter: 1});
    }
  }

  createKey(item: AzureTypedObject) {
    const x = this.typeToPrefixAndCounter.get(item.type);
    if (!x) {
      throw new TypeError(`Unknown type "${item.type}"`);
    }
    return x.prefix + x.counter++;
  }
}
