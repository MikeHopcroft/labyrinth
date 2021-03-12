import {GraphSpec, NodeSpec} from '../../graph';
import {Comparers, IMap, ISet, MapX, SetX} from '../../collections';

import {SymbolTable} from '../symbol_table';
import {IGraphServices, IServiceTagFactory} from '../types';

import {
  AnyAzureObject,
  AzureObjectBase,
  AzureObjectType,
  AzureTypedObject,
  IReleatedX,
  isNodeType,
  IAzureGraphNode,
} from './types';
import {createInternetNode} from './internet';
import {createAzureNode} from './azure_node_factory';

// TODO: Come up with a better name..
export interface ITxNodeFactory {
  createNode(services: IReleatedX, spec: AnyAzureObject): IAzureGraphNode;
  materializeNode(
    serviceTagFactory: IServiceTagFactory,
    graphServices: IGraphServices,
    nodeSpec: IAzureGraphNode
  ): void;
}

export class AzureNodeGraph implements IReleatedX, IGraphServices {
  private readonly specs: IMap<string, AzureTypedObject>;
  private readonly nodes: IMap<string, IAzureGraphNode>;
  private readonly relations: IMap<string, ISet<string>>;
  private readonly labyrinthNodes: NodeSpec[] = [];
  private readonly symbols: SymbolTable;

  constructor(symbols: SymbolTable) {
    this.specs = new MapX<string, AnyAzureObject>(Comparers.CaseInsensitive);
    this.nodes = new MapX<string, IAzureGraphNode>(Comparers.CaseInsensitive);
    this.relations = new MapX<string, Set<string>>(Comparers.CaseInsensitive);
    this.symbols = symbols;
    this.addInternetNode();
  }

  observeRelationsAndRecord(spec: AzureTypedObject) {
    this.specs.set(spec.id, spec);
    const node = createAzureNode(this, spec);
    this.nodes.set(node.specId, node);

    for (const relatedId of node.relatedSpecIds()) {
      this.addRelation(node.specId, relatedId);
      this.addRelation(relatedId, node.specId);
    }
  }

  *getRelated<T extends IAzureGraphNode>(
    refSpec: AzureObjectBase,
    type: AzureObjectType
  ): IterableIterator<T> {
    const set = this.relations.get(refSpec.id);

    if (set) {
      for (const itemId of set.values()) {
        const node = this.nodes.get(itemId);
        if (node) {
          if (isNodeType(node, type)) {
            yield node as T;
          }
        }
      }
    }
  }

  nodeIterator(): IterableIterator<IAzureGraphNode> {
    return this.nodes.values();
  }

  getInternetKey(): string {
    return 'Internet';
  }

  addNode(node: NodeSpec): void {
    this.labyrinthNodes.push(node);
  }

  getLabyrinthGraphSpec(): GraphSpec {
    return {
      nodes: this.labyrinthNodes,
      symbols: this.symbols.getAllSymbolSpecs(),
    };
  }

  getSpec<T extends AzureTypedObject>(specId: string): T {
    const result = this.specs.get(specId);

    if (!result) {
      throw new TypeError(`Unable to locate spec for id '${specId}'`);
    }

    return result as T;
  }

  getSingle<T extends IAzureGraphNode>(
    refSpec: AzureObjectBase,
    type: AzureObjectType
  ): T {
    const result = this.getSingleOrDefault<T>(refSpec, type);

    if (!result) {
      throw new TypeError(
        `Relationship of type '${type}' not found for item '${refSpec.id}'`
      );
    }

    return result;
  }

  getSingleOrDefault<T extends IAzureGraphNode>(
    refSpec: AzureObjectBase,
    type: AzureObjectType
  ): T | undefined {
    const relations = this.getRelated<T>(refSpec, type);

    for (const result of relations) {
      return result;
    }

    return undefined;
  }

  defineServiceTag(tagName: string, range: string): void {
    this.symbols.defineServiceTag(tagName, range);
  }

  private addInternetNode() {
    const node = createInternetNode(this);
    this.nodes.set(node.specId, node);
  }

  private addRelation(fromId: string, toId: string) {
    let set = this.relations.get(fromId);

    if (!set) {
      set = new SetX<string>(Comparers.CaseInsensitive);
      this.relations.set(fromId, set);
    }

    set.add(toId);
  }
}
