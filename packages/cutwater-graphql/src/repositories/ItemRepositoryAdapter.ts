import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemRepository } from '@codification/cutwater-repo';
import { NodeId } from '../core';
import { Node, NodeSource } from '../types';
import { NodeItemDescriptor } from './NodeItemDescriptor';

export class ItemRepositoryAdapter<T> implements ItemRepository<T>, NodeSource<T & Node> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();

  public constructor(
    protected readonly repo: ItemRepository<T>,
    protected readonly descriptor: NodeItemDescriptor<T>,
  ) {}

  public get itemType(): string {
    return this.repo.itemType;
  }

  public getAll(parentId?: string): Promise<T[]> {
    return this.repo.getAll(parentId);
  }

  public get(id: string): Promise<T | undefined> {
    return this.repo.get(id);
  }

  public put(item: T): Promise<T> {
    return this.repo.put(item);
  }

  public remove(id: string): Promise<T | undefined> {
    return this.repo.remove(id);
  }

  public getNodeId(item: T): NodeId {
    return NodeId.create(this.itemType, this.descriptor.getObjectId(item));
  }

  public isSource(nodeIdOrNodeType: NodeId | string): boolean {
    const nodeType = typeof nodeIdOrNodeType === 'string' ? nodeIdOrNodeType : nodeIdOrNodeType.nodeType;
    return nodeType === this.itemType;
  }

  public async resolve(id: NodeId): Promise<(T & Node) | undefined> {
    const result = await this.get(this.descriptor.getItemId(id));
    return result ? this.asNode(result) : undefined;
  }

  public async resolveConnections(parentId?: NodeId): Promise<(T & Node)[]> {
    const result = await this.getAll(this.descriptor.getItemParentId(parentId));
    return result.map(item => this.asNode(item));
  }

  protected asNode(item: T): T & Node {
    if (!Object.keys(item).includes('id')) {
      item['id'] = this.getNodeId(item).id;
    }
    return item as T & Node;
  }
}
