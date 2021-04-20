import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { NodeId } from '../core';
import { ItemRepository, Node, NodeSource } from '../types';
import { NodeItemDescriptor } from './NodeItemDescriptor';

export class ItemRepositoryAdapter<T> implements NodeSource<T & Node> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();

  public constructor(
    protected readonly NODE_TYPE: string,
    protected readonly REPO: ItemRepository<T>,
    protected readonly DESCRIPTOR: NodeItemDescriptor<T>,
  ) {}

  public getNodeId(item: T): NodeId {
    return NodeId.create(this.NODE_TYPE, this.DESCRIPTOR.getObjectId(item));
  }

  public isNodeSource(nodeType: string): boolean {
    return nodeType === this.NODE_TYPE;
  }

  public isSource(id: NodeId): boolean {
    return id.nodeType === this.NODE_TYPE;
  }

  public async resolve(id: NodeId): Promise<(T & Node) | undefined> {
    const result = await this.REPO.get(this.DESCRIPTOR.getItemId(id));
    return result ? this.asNode(result) : undefined;
  }

  public async resolveConnections(parentId?: NodeId): Promise<(T & Node)[]> {
    this.LOG.debug(`Resolving connections for: ${parentId ? parentId.clearId : 'ROOT'}`);
    const result = await this.REPO.getAll(this.DESCRIPTOR.getItemParentId(parentId));
    return result.map(item => this.asNode(item));
  }

  protected asNode(item: T): T & Node {
    if (!Object.keys(item).includes('id')) {
      item['id'] = this.getNodeId(item).id;
    }
    return item as T & Node;
  }
}
