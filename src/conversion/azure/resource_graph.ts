import {
  AzureObjectBase,
  AzureSubnet,
  AzureVirtualNetwork
} from "./types";

// import {AzureObjectBase} from './types';

// TODO: relate AzureObjectBase and AzureIdReference

// export interface AzureObjectId {
//   id: string;
//   resourceGroup: string;
// }

// export interface AzureObject extends AzureObjectId {
//   id: string;
//   name: string;
//   resourceGroup: string;
//   // subscription: string;  // Subnets don't have subscriptions
//   type: string;
// }

class AzureObjectIndex<T extends AzureObjectBase> {
  private readonly type: string;
  private readonly idToItem = new Map<string, T>();

  constructor(type: string) {
    this.type = type;
  }

  add(item: T) {
    // Double check type at runtime to be safe.
    if (item.type !== this.type) {
      const message = `Invalid ${this.type} id ${item.id}.`;
      throw new TypeError(message);
    }

    if (this.idToItem.has(item.id)) {
      const message = `Duplicate ${this.type} id ${item.id}.`;
      throw new TypeError(message);
    }

    this.idToItem.set(item.id, item);
  }

  get(id: string) {
    const item = this.idToItem.get(id);
    if (item === undefined) {
      const message = `Unknown ${this.type} id ${id}.`;
      throw new TypeError(message);
    }
    return item;
  }

  values(): IterableIterator<T> {
    return this.idToItem.values();
  }
}

// class Subscription {
//   name: string;

//   constructor(name: string) {
//     this.name = name;
//   }

//   add(item: AzureObject) {

//   }
// }

class ResourceGraph {
  private readonly subnets = new AzureObjectIndex<AzureSubnet>(
    'microsoft.network/virtualnetworks'
  );
  private readonly vnets = new AzureObjectIndex<AzureVirtualNetwork>(
    'microsoft.network/virtualnetworks'
  );

  constructor(root: AzureObjectBase[]) {
    for (const item of root) {
      this.index(item);
    }
  }

  index(item: AzureObjectBase) {
    this.add(item);
  }

  add(item: AzureObject) {

  }
}
