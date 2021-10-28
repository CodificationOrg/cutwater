import { ItemRepository } from '..';
import { ItemDescriptor } from '../types/ItemDescriptor';

export class MemoryItemRepository<T> implements ItemRepository<T> {
  private readonly repo: Record<string, T> = {};

  public constructor(public readonly itemType: string, private readonly descriptor: ItemDescriptor<T>) {}

  public getAll(parentId?: string): Promise<T[]> {
    if (parentId) {
      return Promise.resolve(Object.values(this.repo).filter(item => this.descriptor.getParentId(item) === parentId));
    } else {
      return Promise.resolve(Object.values(this.repo));
    }
  }

  public get(id: string): Promise<T | undefined> {
    return Promise.resolve(this.repo[id]);
  }

  public put(item: T): Promise<T> {
    this.repo[this.descriptor.getId(item)] = item;
    return Promise.resolve(item);
  }

  public putAll(items: T[]): Promise<T[]> {
    items.forEach(item => {
      this.repo[this.descriptor.getId(item)] = item;
    });
    return Promise.resolve(items);
  }

  public remove(id: string): Promise<T | undefined> {
    const rval = this.repo[id];
    delete this.repo[id];
    return Promise.resolve(rval);
  }
}
