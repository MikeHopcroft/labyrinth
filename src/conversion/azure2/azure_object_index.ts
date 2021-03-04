import {
  AnyAzureObject,
  AzureIdReference,
  AzureReference,
  AzureResourceGraph,
} from './types';
import {walkAzureTypedObjects} from './walk';

export class AzureObjectIndex {
  private readonly idToAzureObject = new Map<string, AnyAzureObject>();

  constructor(spec: AzureResourceGraph) {
    for (const item of walkAzureTypedObjects(spec)) {
      this.idToAzureObject.set(item.id, item as AnyAzureObject);
    }
  }

  add(item: AnyAzureObject) {
    if (this.idToAzureObject.has(item.id)) {
      const message = `Duplicate Azure resource graph id "${item.id}"`;
      throw new TypeError(message);
    }

    this.idToAzureObject.set(item.id, item);
  }

  has(input: AzureIdReference): boolean {
    return this.idToAzureObject.has(input.id);
  }

  get(id: string): AnyAzureObject {
    const item = this.idToAzureObject.get(id);
    if (item === undefined) {
      const message = `Unknown Azure resource graph id "${id}"`;
      throw new TypeError(message);
    }
    return item;
  }

  // TODO: REVIEW: is it worth forgoing runtime type safety as this function
  // does, or should we insist on checks like asAzureVirtualNetwork()?
  // Also, do we wanta dereference() method that knows about AzureReferences
  // or should we just rely on the basic getItem()?
  dereference<T extends AnyAzureObject>(ref: AzureReference<T>) {
    return this.get(ref.id) as T;
  }
}
