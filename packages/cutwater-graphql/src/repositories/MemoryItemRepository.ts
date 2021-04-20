import { ItemRepository } from '..';
import { ItemDescriptor } from './ItemDescriptor';

export class MemoryItemRepository<T> implements ItemRepository<T> {
  private readonly REPO: Record<string, T> = {};

  public constructor(private readonly DESCRIPTOR: ItemDescriptor<T>) {}

  public getAll(parentId?: string): Promise<T[]> {
    if (parentId) {
      return Promise.resolve(Object.values(this.REPO).filter(item => this.DESCRIPTOR.getParentId(item) === parentId));
    } else {
      return Promise.resolve(Object.values(this.REPO));
    }
  }

  public get(id: string): Promise<T | undefined> {
    return Promise.resolve(this.REPO[id]);
  }

  public put(item: T): Promise<T> {
    this.REPO[this.DESCRIPTOR.getId(item)] = item;
    return Promise.resolve(item);
  }

  public remove(id: string): Promise<T | undefined> {
    const rval = this.REPO[id];
    delete this.REPO[id];
    return Promise.resolve(rval);
  }
}
