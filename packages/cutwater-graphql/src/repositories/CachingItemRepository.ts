import { InMemoryLRUCache } from 'apollo-server-caching';
import { ItemRepository } from '../types';
import { ItemCache } from './ItemCache';
import { ItemDescriptor } from './ItemDescriptor';

export interface RepositoryConfig<T> {
  name: string;
  itemDescriptor: ItemDescriptor<T>;
  ttl?: number;
}

export class CachingItemRepository<T> implements ItemRepository<T> {
  public readonly name: string;

  private readonly ROOT_OBJECT_ID = 'ROOT_OBJECT_ID';
  private readonly DESCRIPTOR: ItemDescriptor<T>;
  private readonly CACHE_TTL: number;
  private readonly ITEM_CACHES: Record<string, ItemCache<T>> = {};

  public constructor(
    private readonly REPO: ItemRepository<T>,
    private readonly CACHE: InMemoryLRUCache,
    { name, itemDescriptor, ttl }: RepositoryConfig<T>,
  ) {
    this.name = name;
    this.DESCRIPTOR = itemDescriptor;
    this.CACHE_TTL = ttl || 90;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    const itemCache = this.getItemCache(parentId);
    let rval: T[] = await itemCache.getAll();
    if (rval.length === 0) {
      rval = await itemCache.putAll(await this.REPO.getAll(parentId));
    }
    return rval;
  }

  public async get(id: string): Promise<T | undefined> {
    let rval: T | undefined;
    const itemCache = this.getItemCacheForItemId(id);
    if (itemCache) {
      rval = await itemCache.get(id);
    }
    if (!rval) {
      rval = await this.REPO.get(id);
      if (itemCache && rval) {
        itemCache.put(rval);
      }
    }
    return rval;
  }

  public async put(item: T): Promise<T> {
    const itemCache = this.getItemCache(this.DESCRIPTOR.getParentId(item));
    return await itemCache.put(await this.REPO.put(item));
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.REPO.remove(id);
    const itemCache = this.getItemCacheForItemId(id);
    if (itemCache) {
      await itemCache.remove(id);
    }
    return rval;
  }

  private getItemCache(parentId: string = this.ROOT_OBJECT_ID): ItemCache<T> {
    let rval = this.ITEM_CACHES[parentId];
    if (!rval) {
      rval = new ItemCache<T>(this.CACHE, {
        repoName: this.name,
        cacheId: parentId,
        itemDescriptor: this.DESCRIPTOR,
        ttl: this.CACHE_TTL,
      });
      this.ITEM_CACHES[parentId] = rval;
    }
    return rval;
  }

  private getItemCacheForItemId(id: string): ItemCache<T> | undefined {
    const parentId = Object.keys(this.ITEM_CACHES).find(parentId => this.ITEM_CACHES[parentId].includes(id));
    return parentId ? this.getItemCache(parentId) : undefined;
  }
}
