import { MemoryCache } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { Key, SemaphoreLock } from '@codification/cutwater-node-core';

import { ItemDescriptor, ItemRepository } from '../types';
import { ItemCache } from './ItemCache';
import { MemoryItemRepository } from './MemoryItemRepository';
import { MockItem, RandomRange } from './MockItem';

export interface RepositoryConfig<T> {
  name: string;
  greedy?: boolean;
  itemDescriptor: ItemDescriptor<T>;
  ttl?: number;
}

export class CachingItemRepository<T> implements ItemRepository<T> {
  private static readonly ROOT_OBJECT_ID = 'ROOT_OBJECT_ID';
  protected readonly LOG: Logger = LoggerFactory.getLogger();

  private key: Key | undefined;
  private readonly lock = new SemaphoreLock();

  public readonly name: string;
  private readonly greedy: boolean;
  private readonly descriptor: ItemDescriptor<T>;
  private readonly ttl: number;
  private readonly itemCaches: Record<string, ItemCache<T>> = {};

  public static createNullable(
    items?: number | RandomRange | MockItem[] | ItemRepository<MockItem>,
    greedy = false
  ): CachingItemRepository<MockItem> {
    let repo: ItemRepository<MockItem>;
    if (items && typeof items === 'object' && 'getAll' in items) {
      repo = items;
    } else {
      repo = MemoryItemRepository.createNullable(items);
    }
    return new CachingItemRepository<MockItem>(repo, {
      name: 'MockItems',
      itemDescriptor: MockItem.ITEM_DESCRIPTOR,
      greedy,
    });
  }

  public constructor(
    private readonly repo: ItemRepository<T>,
    { name, itemDescriptor, ttl, greedy = false }: RepositoryConfig<T>,
    private readonly memCache: MemoryCache = new MemoryCache()
  ) {
    this.name = name;
    this.descriptor = itemDescriptor;
    this.ttl = ttl || 90;
    this.greedy = greedy;
  }

  public get itemType(): string {
    return this.repo.itemType;
  }

  public async invalidate(itemOrId: string | T): Promise<void> {
    const id =
      typeof itemOrId === 'string' ? itemOrId : this.descriptor.getId(itemOrId);
    await this.getItemCacheForItemId(id)?.invalidate(id);
  }

  public async getAll(parentId?: string): Promise<T[]> {
    let rval: T[] = await this.getAllCached(parentId);
    if (rval.length === 0) {
      rval = await this.cacheAll(await this.repo.getAll(parentId), parentId);
    }
    return rval;
  }

  private async aquireLock(): Promise<void> {
    if (this.greedy) {
      this.key = await this.lock.aquire();
    }
  }

  private releaseLock(): void {
    if (this.greedy && this.key) {
      this.lock.release(this.key);
    }
  }

  private async addToCache(id: string): Promise<T | undefined> {
    const rval: T | undefined = await this.repo.get(id);
    if (rval && this.greedy) {
      await this.getAll(this.descriptor.getParentId(rval));
    }
    return rval ? await this.cache(rval) : undefined;
  }

  public async get(id: string): Promise<T | undefined> {
    await this.aquireLock();
    const rval = (await this.getCached(id)) || (await this.addToCache(id));
    this.releaseLock();
    return rval;
  }

  public async put(item: T): Promise<T> {
    return await this.cache(await this.repo.put(item));
  }

  public async putAll(items: T[], parentId?: string): Promise<T[]> {
    return this.cacheAll(await this.repo.putAll(items), parentId);
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.repo.remove(id);
    const itemCache = this.getItemCacheForItemId(id);
    if (itemCache) {
      await itemCache.remove(id);
    }
    return rval;
  }

  public async removeAll(ids: string[]): Promise<string[]> {
    const rval = await this.repo.removeAll(ids);
    for (const id of ids) {
      const itemCache = this.getItemCacheForItemId(id);
      if (itemCache) {
        await itemCache.remove(id);
      }
    }
    return rval;
  }

  protected async cache(item: T): Promise<T> {
    return await this.getItemCache(this.descriptor.getParentId(item)).put(item);
  }

  protected async cacheAll(items: T[], parentId?: string): Promise<T[]> {
    if (parentId) {
      return await this.getItemCache(parentId).putAll(items);
    } else {
      const rval: T[] = [];
      for (const item of items) {
        rval.push(await this.cache(item));
      }
      return rval;
    }
  }

  protected async getCached(id: string): Promise<T | undefined> {
    const itemCache = this.getItemCacheForItemId(id);
    if (itemCache) {
      return await itemCache.get(id);
    }
    return undefined;
  }

  protected async getAllCached(parentId?: string): Promise<T[]> {
    return await this.getItemCache(parentId).getAll();
  }

  private getItemCache(
    parentId: string = CachingItemRepository.ROOT_OBJECT_ID
  ): ItemCache<T> {
    let rval = this.itemCaches[parentId];
    if (!rval) {
      this.LOG.debug(
        `[${this.name}] - Creating cache for parentId: `,
        parentId
      );
      rval = new ItemCache<T>(this.memCache, {
        repoName: this.name,
        cacheId: parentId,
        itemDescriptor: this.descriptor,
        ttl: this.ttl,
      });
      this.itemCaches[parentId] = rval;
    }
    return rval;
  }

  private getItemCacheForItemId(id: string): ItemCache<T> | undefined {
    const parentId = Object.keys(this.itemCaches).find((parentId) =>
      this.itemCaches[parentId].includes(id)
    );
    return parentId ? this.getItemCache(parentId) : undefined;
  }
}
