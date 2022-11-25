import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemRepository } from '@codification/cutwater-repo';
import DataLoader from 'dataloader';
import { NodeId } from '../core';
import { Node, NodeSource } from '../types';
import { NodeItemDescriptor } from './NodeItemDescriptor';

export class ItemRepositoryAdapter<T> implements ItemRepository<T>, NodeSource<T & Node> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();
  public readonly dataLoader: DataLoader<string, T | undefined>;

  public constructor(protected readonly repo: ItemRepository<T>, protected readonly descriptor: NodeItemDescriptor<T>) {
    this.dataLoader = this.createDataLoader();
  }

  private createDataLoader(): DataLoader<string, T | undefined> {
    return new DataLoader(
      async (keys: string[]): Promise<(T | undefined)[]> => {
        const results: (T | undefined)[] = await Promise.all(keys.map(id => this.repo.get(id)));
        return keys.map(id => {
          return results.find(item => !!item && this.descriptor.getObjectId(item) === id);
        });
      },
    );
  }

  public get itemType(): string {
    return this.repo.itemType;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    return this.primeDataLoader(await this.repo.getAll(parentId));
  }

  public get(id: string): Promise<T | undefined> {
    return this.dataLoader.load(id);
  }

  public async put(item: T): Promise<T> {
    return this.primeDataLoader([await this.repo.put(item)])[0];
  }

  public async putAll(items: T[]): Promise<T[]> {
    return this.primeDataLoader(await this.repo.putAll(items));
  }

  public remove(id: string): Promise<T | undefined> {
    this.dataLoader.clear(id);
    return this.repo.remove(id);
  }

  public removeAll(ids: string[]): Promise<string[]> {
    ids.forEach(id => this.dataLoader.clear(id));
    return this.repo.removeAll(ids);
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
    const result = await this.getAll(parentId ? this.descriptor.getItemId(parentId) : undefined);
    return result.map(item => this.asNode(item));
  }

  protected asNode(item: T): T & Node {
    if (!Object.keys((item as unknown) as object).includes('id')) {
      item['id'] = this.getNodeId(item).id;
    }
    return item as T & Node;
  }

  private primeDataLoader(items: T[]): T[] {
    items.forEach(item =>
      this.dataLoader.clear(this.descriptor.getObjectId(item)).prime(this.descriptor.getObjectId(item), item),
    );
    return items;
  }
}
