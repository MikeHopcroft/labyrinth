import {NodeSpec} from '../../graph';

import {AzureTypedObject, azureTypeNames} from './azure_types';

export class NodeServices {
  private readonly idToKey = new Map<string, string>();
  private readonly typeToPrefixAndCounter = new Map<
    string,
    {prefix: string; counter: number}
  >();
  private readonly keyToNode = new Map<string, NodeSpec>();
  private readonly typesInUse = new Set<string>();

  constructor() {
    for (const [type, prefix] of azureTypeNames) {
      // if (type === '') {
      //   throw new TypeError('azureTypeNames may not use empty string for type name.');
      // }
      this.typeToPrefixAndCounter.set(type, {prefix, counter: 1});
    }
  }

  // DESIGN NOTE: keys are sometimes used for symbols that appear in constraint
  // expressions. For this reason, generated keys may not contain commas and
  // hyphens, as these are used to indicate unions and ranges. Keys also should
  // not collide with reserved words like 'except', 'all', 'any', and '*'.
  // Key generation schemes should also ensure that generated keys don't collide
  // with user-defined symbols.
  //
  // TODO: strategy to avoid collisions with user-defined symbols. Perhaps
  // class constructor should take a reference to the symbol table. Would also
  // need to consider the case where an new symbol collides with an existing
  // keyword. Another approach may be to ensure format of keys is disallows for
  // symbols (e.g. start keys with, say, underscores).
  //
  // DESIGN NOTE: we may at some point want to create keys for concepts that
  // don't have an AzureObjectType and perhaps aren't associated with an Azure
  // object id field.
  //
  // Generates a unique node key based on an AzureTypedObject's type. Will
  // return the same key on subsequent calls with the same item.id.
  createKey(item: AzureTypedObject) {
    const key = this.idToKey.get(item.id);
    if (key !== undefined) {
      return key;
    } else {
      const x = this.typeToPrefixAndCounter.get(item.type);
      if (!x) {
        throw new TypeError(`Unknown type "${item.type}"`);
      }
      const key = x.prefix + x.counter++;
      this.idToKey.set(item.id, key);
      return key;
    }
  }

  createRouterKey(item: AzureTypedObject) {
    const prefix = this.createKey(item);
    return this.createKeyVariant(prefix, 'router');
  }

  createInboundKey(item: AzureTypedObject) {
    const prefix = this.createKey(item);
    return this.createKeyVariant(prefix, 'inbound');
  }

  createOutboundKey(item: AzureTypedObject) {
    const prefix = this.createKey(item);
    return this.createKeyVariant(prefix, 'outbound');
  }

  createKeyVariant(key: string, suffix: string) {
    return key + '/' + suffix;
  }

  add(node: NodeSpec) {
    if (this.keyToNode.has(node.key)) {
      const message = `Duplicate node key ${node.key}`;
      throw new TypeError(message);
    }
    this.keyToNode.set(node.key, node);
  }

  get(key: string): NodeSpec | undefined {
    return this.keyToNode.get(key);
  }

  nodes(): IterableIterator<NodeSpec> {
    return this.keyToNode.values();
  }

  clearNodes() {
    this.keyToNode.clear();
  }

  markTypeAsUsed(item: AzureTypedObject) {
    this.typesInUse.add(item.type);
  }

  isTypeInUse(item: AzureTypedObject): boolean {
    return this.typesInUse.has(item.type);
  }
}
