import { MemoryCache } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';

import { ItemDescriptor } from '../types';
import { MockItem, RandomRange } from './MockItem';

export interface CacheConfig<T> {
  repoName: string;
  cacheId: string;
  itemDescriptor: ItemDescriptor<T>;
  ttl?: number;
}

type CachedItems<T> = Record<string, T>;

export class ItemCache<T> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();

  public readonly cacheId: string;
  private readonly idIndex: string[] = [];
  private readonly cacheKey: string;
  private readonly repoName: string;
  private readonly cacheTTL: number;
  private readonly descriptor: ItemDescriptor<T>;

  public static createNullable(
    items?: number | RandomRange | MockItem[]
  ): ItemCache<MockItem> {
    const rval = new ItemCache<MockItem>(new MemoryCache(), {
      repoName: 'stuff',
      cacheId: 'PLACEHOLDER',
      itemDescriptor: MockItem.ITEM_DESCRIPTOR,
      ttl: 50,
    });
    if (items) {
      if (Array.isArray(items)) {
        rval.putAll(items);
      } else {
        rval.putAll(MockItem.createNullables(items));
      }
    }
    return rval;
  }

  public constructor(
    private readonly CACHE: MemoryCache,
    { repoName, cacheId, itemDescriptor, ttl }: CacheConfig<T>
  ) {
    this.repoName = repoName;
    this.cacheId = cacheId;
    this.descriptor = itemDescriptor;
    this.cacheTTL = ttl || 90;
    this.cacheKey = this.toKey(`${cacheId}_CACHE`);
  }

  public includes(id: string): boolean {
    return this.idIndex.includes(id);
  }

  public invalidate(idOrItem: string | T): void {
    const id =
      typeof idOrItem === 'string' ? idOrItem : this.descriptor.getId(idOrItem);
    this.remove(id);
  }

  public getAll(): T[] {
    return Object.values(this.getCachedBulk() || {});
  }

  public putAll(items: T[]): T[] {
    return Object.values(this.setCachedBulk(items));
  }

  public get(id: string): T | undefined {
    let rval: T | undefined = this.CACHE.get(this.toKey(id));
    if (!rval && this.idIndex.includes(id)) {
      rval = (this.getCachedBulk() || {})[id];
    }
    if (!rval) {
      this.LOG.trace(`[${this.repoName}] Cache miss: `, id);
    }
    return rval;
  }

  public put(item: T): T {
    const id = this.descriptor.getId(item);
    this.CACHE.put<T>(this.toKey(id), item, this.cacheTTL);
    const rval = this.CACHE.get<T>(this.toKey(id));
    if (!rval) {
      throw new Error(`[${this.repoName}] Failed to cache item: ${id}`);
    }
    if (!this.idIndex.includes(id)) {
      this.idIndex.push(id);
    }
    const cachedItems = this.getCachedBulk();
    if (cachedItems) {
      cachedItems[id] = rval;
      this.setCachedBulk(cachedItems);
    }
    this.LOG.trace(`[${this.repoName}] Added to cache[${id}]: `, rval);
    return rval;
  }

  public remove(id: string): T | undefined {
    let rval: T | undefined = this.get(id);
    if (this.idIndex.includes(id)) {
      const index = this.idIndex.indexOf(id);
      this.idIndex.splice(index, 1);
    }
    const cachedItems = this.getCachedBulk();
    if (cachedItems) {
      rval = cachedItems[id];
      delete cachedItems[id];
      this.setCachedBulk(cachedItems);
    }
    this.CACHE.remove(this.toKey(id));
    if (rval) {
      this.LOG.trace(`[${this.repoName}] Removed from cache: `, id);
    }
    return rval;
  }

  protected setCachedBulk(itemsOrCache: T[] | CachedItems<T>): CachedItems<T> {
    const rval: CachedItems<T> = Array.isArray(itemsOrCache)
      ? itemsOrCache.reduce<Record<string, T>>((cachedItems, item) => {
          const id = this.descriptor.getId(item);
          if (!this.idIndex.includes(id)) {
            this.idIndex.push(id);
          }
          cachedItems[id] = item;
          return cachedItems;
        }, {})
      : itemsOrCache;
    this.LOG.debug(
      `[${this.repoName}] Bulk cache added[${this.cacheKey}]: `,
      Object.keys(rval).length
    );
    this.CACHE.put(this.cacheKey, rval, this.cacheTTL);
    return rval;
  }

  protected getCachedBulk(): CachedItems<T> | undefined {
    return this.CACHE.get(this.cacheKey);
  }

  private toKey(key: string): string {
    return `${this.repoName}:${key}`;
  }
}
