import fs from 'fs';

import {
  AnyAzureObject,
  AzureLocalIP,
  AzureObjectBase,
  AzureObjectType,
  AzurePublicIp,
  AzureSubnet,
  AzureVirtualNetwork,
} from './azure_types';

// TODO: relate AzureObjectBase and AzureIdReference

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* walk(root: any): IterableIterator<AzureObjectBase> {
  if (root && typeof root === 'object') {
    // NOTE: cannot use destructuring here because `root` is `any`.
    const id = root.id;
    const name = root.name;
    const resourceGroup = root.resourceGroup;
    const type = root.type;

    if (id && name && resourceGroup && type) {
      yield root;
    }
    for (const key in root) {
      // https://eslint.org/docs/rules/no-prototype-builtins
      if (!Object.prototype.hasOwnProperty.call(root, key)) {
        continue;
      }

      yield* walk(root[key]);
    }
  }
}

export class ResourceGraph {
  private readonly localIPs = new AzureObjectIndex<AzureLocalIP>(
    AzureObjectType.LOCAL_IP
  );

  private readonly publicIPs = new AzureObjectIndex<AzurePublicIp>(
    AzureObjectType.PUBLIC_IP
  );

  private readonly subnets = new AzureObjectIndex<AzureSubnet>(
    AzureObjectType.SUBNET
  );
  private readonly vnets = new AzureObjectIndex<AzureVirtualNetwork>(
    AzureObjectType.VIRTUAL_NETWORK
  );

  constructor(root: AnyAzureObject[]) {
    for (const item of walk(root)) {
      this.index(item as AnyAzureObject);
    }
  }

  private index(item: AnyAzureObject) {
    // Only index the three items types we're interested.
    // All other items will be found by a direct tree traversal.
    if (item.type === AzureObjectType.VIRTUAL_NETWORK) {
      // Want vnets in order to create the `Internet` service tag.
      this.vnets.add(item);
    } else if (item.type === AzureObjectType.LOCAL_IP) {
      // Want localIPs because they are referenced from subnets.
      this.localIPs.add(item);
    } else if (item.type === AzureObjectType.PUBLIC_IP) {
      // Want publicIPs because they are referenced from subnets.
      this.publicIPs.add(item);
    }
  }
}

function go() {
  const text = fs.readFileSync('data/azure/resource-graph-1.json', 'utf8');
  const root = JSON.parse(text);
  for (const node of walk(root)) {
    console.log(node.type + ':');
  }
}

go();
