import {AzureTypedObject} from '../azure/types';
import {NodeKeyAndSourceIp} from './converters';
import {GraphServices} from './graph_services';
import {AzureObjectType} from './types';

export interface IAzureGraphNode {
  readonly key: string;
  readonly type: AzureObjectType;
  edges(): IterableIterator<string>;
  addEdge(node: IAzureGraphNode): void;
}

function asKey(input: string): string {
  return input.toLowerCase();
}

export abstract class AzureGraphNode<T extends AzureTypedObject>
  implements IAzureGraphNode {
  readonly value: T;
  readonly type: AzureObjectType;
  readonly key: string;

  private readonly edgeSet: Set<string>;
  private readonly typeToEdge: Map<AzureObjectType, Set<IAzureGraphNode>>;
  protected readonly nodes: IAzureGraphNode[];

  private conversionResult: NodeKeyAndSourceIp | undefined;

  protected constructor(type: AzureObjectType, item: T) {
    this.key = asKey(item.id);
    this.type = type;
    this.value = item;
    this.edgeSet = new Set<string>();
    this.typeToEdge = new Map<AzureObjectType, Set<IAzureGraphNode>>();
    this.nodes = [];
  }

  edges(): IterableIterator<string> {
    return [].values();
  }

  addEdge(node: IAzureGraphNode): void {
    if (!this.edgeSet.has(node.key)) {
      this.edgeSet.add(node.key);
      this.nodes.push(node);
      node.addEdge(this);

      let set = this.typeToEdge.get(node.type);

      if (!set) {
        set = new Set<IAzureGraphNode>();
        this.typeToEdge.set(node.type, set);
      }

      set.add(node);
    }
  }

  *typedEdges<T extends IAzureGraphNode>(
    type: AzureObjectType
  ): IterableIterator<T> {
    const set = this.typeToEdge.get(type);

    if (set) {
      for (const item of set.values()) {
        yield item as T;
      }
    }
  }

  first<T extends IAzureGraphNode>(type: AzureObjectType): T {
    const result = this.firstOrDefault<T>(type);

    if (!result) {
      throw new TypeError(`Failed to find edge of type ${type}`);
    }

    return result;
  }

  firstOrDefault<T extends IAzureGraphNode>(
    type: AzureObjectType
  ): T | undefined {
    const items = this.typedEdges<T>(type);
    const result = items.next();
    return result?.value;
  }

  convert(services: GraphServices): NodeKeyAndSourceIp {
    if (!this.conversionResult) {
      this.conversionResult = this.convertNode(services);
    }

    return this.conversionResult;
  }

  protected abstract convertNode(services: GraphServices): NodeKeyAndSourceIp;
}

export class DefaultNode extends AzureGraphNode<AzureTypedObject> {
  constructor(input: AzureTypedObject) {
    super(input.type as AzureObjectType, input);
  }

  edges(): IterableIterator<string> {
    return [].values();
  }

  convertNode(services: GraphServices): NodeKeyAndSourceIp {
    throw new Error('Method not implemented.');
  }
}
