import {
  AnyAzureObject,
  AzureObjectBase,
  AzureObjectType,
  AzureReference,
  AzureResourceGraph,
} from './azure_types';

import {walkAzureTypedObjects} from './walk';

export class AzureObjectIndex {
  private readonly idToAzureObject = new Map<string, AnyAzureObject>();
  private readonly typeToAzureObjects = new Map<
    AzureObjectType,
    Set<AnyAzureObject>
  >();
  private readonly forAndTypeToAzureObject = new Map<
    string,
    Map<AzureObjectType, Set<AnyAzureObject>>
  >();

  constructor(spec: AzureResourceGraph) {
    for (const item of walkAzureTypedObjects(spec)) {
      this.add(item as AnyAzureObject);
    }
  }

  add(item: AnyAzureObject) {
    if (this.idToAzureObject.has(item.id)) {
      const message = `Duplicate Azure resource graph id "${item.id}"`;
      throw new TypeError(message);
    }
    this.idToAzureObject.set(item.id, item);

    let items = this.typeToAzureObjects.get(item.type);
    if (!items) {
      items = new Set<AnyAzureObject>();
      this.typeToAzureObjects.set(item.type, items);
    }
    items.add(item);
  }

  addReference(item: AnyAzureObject, forItem: AzureObjectBase) {
    let forMap = this.forAndTypeToAzureObject.get(forItem.id);
    if (!forMap) {
      forMap = new Map<AzureObjectType, Set<AnyAzureObject>>();
      this.forAndTypeToAzureObject.set(forItem.id, forMap);
    }
    let typeSet = forMap.get(item.type);
    if (!typeSet) {
      typeSet = new Set<AnyAzureObject>();
      forMap.set(item.type, typeSet);
    }
    typeSet.add(item);
  }

  has(id: string): boolean {
    return this.idToAzureObject.has(id);
  }

  // TODO: REVIEW: is it worth forgoing runtime type safety as this function
  // does, or should we insist on checks like asAzureVirtualNetwork()?
  // Also, do we wanta dereference() method that knows about AzureReferences
  // or should we just rely on the basic getItem()?
  dereference<T extends AnyAzureObject>(ref: AzureReference<T>) {
    const item = this.idToAzureObject.get(ref.id);
    if (item === undefined) {
      const message = `Unknown Azure resource graph id "${ref.id}"`;
      throw new TypeError(message);
    }
    return item as T;
  }

  *withType<T extends AnyAzureObject>(type: T): IterableIterator<T> {
    const items = this.typeToAzureObjects.get(type.type);
    if (items) {
      yield* (items as Set<T>).values();
    }
  }

  for(ref: AzureObjectBase) {
    const typeToAzureObjects = this.forAndTypeToAzureObject.get(ref.id);
    return {
      *withType<T extends AnyAzureObject>(type: T): IterableIterator<T> {
        if (typeToAzureObjects) {
          const items = typeToAzureObjects.get(type.type);
          if (items) {
            yield* (items as Set<T>).values();
          }
        }
      },
    };
  }
}
