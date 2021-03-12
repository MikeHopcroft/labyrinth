import {
  AnyAzureObject,
  AzureObjectType,
  AzureReference,
  AzureResourceGraph
} from "./types";

import {walkAzureTypedObjects} from './walk';

// function asFoo<T extends string>(type: T, item: AnyAzureObject) {
//   if (item.type === type) {
//     return item;
//   }
//   throw 0;
// }

// // const fake = {type: AzureObjectType.LOCAL_IP}
// const fake = {} as AzureIPConfiguration;
// const x = asFoo(AzureObjectType.LOCAL_IP, fake);


///////////////////////////////////////////////////////////////////////////////

export class AzureObjectGroups {
  private readonly index = new Map<string, Map<AzureObjectType, Set<AnyAzureObject>>>();

  constructor(spec: AzureResourceGraph) {
    for (const item of walkAzureTypedObjects(spec)) {
      this.add(item as AnyAzureObject);
    }
  }

  add(item: AnyAzureObject, forId: string = '') {
    let forMap = this.index.get(forId);
    if (!forMap) {
      forMap = new Map<AzureObjectType, Set<AnyAzureObject>>();
      this.index.set(forId, forMap);
    }
    let typeSet = forMap.get(item.type);
    if (!typeSet) {
      typeSet = new Set<AnyAzureObject>();
      forMap.set(item.type, typeSet);
    }
    typeSet.add(item);
  }

  *items<T extends AnyAzureObject>(
    type: AzureObjectType,
    forItem: AnyAzureObject | undefined = undefined
  ): IterableIterator<T> {
    const forId = forItem ? forItem.id : '';
    const forMap = this.index.get(forId);
    if (forMap) {
      const typeSet = forMap.get(type);
      if (typeSet) {
        yield* typeSet.values() as IterableIterator<T>;
      }
    }
  }
}