import {GraphSpec, NodeSpec} from '../../graph';
import {Comparers, IComparer, IMap, ISet, MapX, SetX} from '../../collections';

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
import * as Converter from './converters';
import {noOpMaterialize} from './convert_common';
import {createInternetNode} from './internet';
import {normalizedNodeKey, normalizedSymbolKey} from './formatters';

// TODO: Come up with a better name..
export interface ITxNodeFactory {
  createNode(services: IReleatedX, spec: AnyAzureObject): IAzureGraphNode;
  materializeNode(
    serviceTagFactory: IServiceTagFactory,
    graphServices: IGraphServices,
    nodeSpec: IAzureGraphNode
  ): void;
}

function createDefaultNode(
  services: IReleatedX,
  spec: AnyAzureObject
): IAzureGraphNode {
  return {
    serviceTag: normalizedSymbolKey(spec.id),
    nodeKey: normalizedNodeKey(spec.id),
    specId: spec.id,
    type: spec.type,
    relatedSpecIds: () => {
      return [].values();
    },
    materialize: noOpMaterialize,
  };
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
    const node = AzureNodeGraph.createNode(this, spec);
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

  // TODO. Move this somewhere else it can be tested..
  private static createNode(
    services: IReleatedX,
    azureType: AzureTypedObject
  ): IAzureGraphNode {
    const input = azureType as AnyAzureObject;
    const normalizedType = input.type.toLowerCase();
    switch (normalizedType) {
      case AzureObjectType.VIRTUAL_NETWORK:
        return Converter.createVirtualNetworkNode(services, input);
      case AzureObjectType.SUBNET:
        return Converter.createSubnetNode(services, input);
      case AzureObjectType.NSG:
        return Converter.createNetworkSecurityGroupNode(services, input);
      case AzureObjectType.NIC:
        return Converter.createNetworkInterfaceNode(services, input);
      case AzureObjectType.LOAD_BALANCER:
        return Converter.createLoadBalancerNode(services, input);
      case AzureObjectType.LOAD_BALANCER_RULE:
        return Converter.createLoadBalancerRuleNode(services, input);
      case AzureObjectType.LOAD_BALANCER_NAT_RULE_INBOUND:
        return Converter.createLoadBalancerNatRuleNode(services, input);
      case AzureObjectType.LOAD_BALANCER_BACKEND_POOL:
        return Converter.createLoadBalancerBackendPool(services, input);
      case AzureObjectType.LOAD_BALANCER_FRONT_END_IP:
        return Converter.createLoadBalancerFrontEndIpNode(services, input);
      case AzureObjectType.PUBLIC_IP:
      case AzureObjectType.LOCAL_IP:
        return Converter.createIpNode(services, input);
      case AzureObjectType.VMSS_VIRTUAL_IP:
        return Converter.createVMSSVirtualIpNode(services, input);
      case AzureObjectType.VMSS_VIRTUAL_NIC:
        return Converter.createVMSSVirtualIpNIC(services, input);
      case AzureObjectType.VIRTUAL_MACHINE_SCALE_SET:
        return Converter.createVirtualMachineScaleSetNode(services, input);
      default:
        return createDefaultNode(services, input);
    }
  }
}
