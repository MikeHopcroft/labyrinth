export interface IGraphENode {
  key: string;
  edges(): IterableIterator<string>;
  addEdge(node: IGraphENode): void;
}

export interface INodeFactory<TInput, TStorageNode> {
  (input: TInput): TStorageNode;
}

export class GraphE<TInput, TStorageNode extends IGraphENode> {
  private readonly nodes = new Map<string, TStorageNode>();
  private readonly edges = new Map<string, Set<string>>();
  private readonly nodeFactory: INodeFactory<TInput, TStorageNode>;

  constructor(nodeFactory: INodeFactory<TInput, TStorageNode>) {
    this.nodeFactory = nodeFactory;
  }

  addNode(input: TInput): TStorageNode {
    const node = this.nodeFactory(input);
    this.nodes.set(node.key, node);

    for (const edgeKey of node.edges()) {
      this.addOrDeferEdge(node, this.asKey(edgeKey));
    }

    const deferredEdges = this.edges.get(node.key);

    if (deferredEdges) {
      for (const edgeKey of deferredEdges) {
        this.addOrDeferEdge(node, edgeKey);
      }

      this.edges.delete(node.key);
    }

    return node;
  }

  getNode<T extends TStorageNode>(id: string): T {
    return this.nodes.get(this.asKey(id)) as T;
  }

  hasNode(id: string): boolean {
    return this.nodes.has(this.asKey(id));
  }

  unresolvedEdges(): IterableIterator<string> {
    return this.edges.keys();
  }

  validate() {
    if (this.edges.size > 0) {
      console.log(JSON.stringify([...this.edges.keys()]));
      throw new Error('Spec is invalid and currently has unresolved edges');
    }
  }

  protected asKey(input: string) {
    return input.toLowerCase();
  }

  private addOrDeferEdge(node: TStorageNode, edgeKey: string) {
    const edgeNode = this.nodes.get(edgeKey);

    if (!edgeNode) {
      this.addDeferredEdge(edgeKey, node.key);
    } else {
      node.addEdge(edgeNode);
    }
  }

  private addDeferredEdge(edgeKey: string, peerKey: string) {
    let set = this.edges.get(edgeKey);

    if (!set) {
      set = new Set<string>();
      this.edges.set(edgeKey, set);
    }

    set.add(peerKey);
  }
}
