import { MemoryCache } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemDescriptor } from '../types';

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

  public constructor(private readonly CACHE: MemoryCache, { repoName, cacheId, itemDescriptor, ttl }: CacheConfig<T>) {
    this.repoName = repoName;
    this.cacheId = cacheId;
    this.descriptor = itemDescriptor;
    this.cacheTTL = ttl || 90;
    this.cacheKey = this.toKey(`${cacheId}_CACHE`);
  }

  public includes(id: string): boolean {
    return this.idIndex.includes(id);
  }

  public async getAll(): Promise<T[]> {
    return Object.values((await this.getCachedBulk()) || {});
  }

  public async putAll(items: T[]): Promise<T[]> {
    return Object.values(await this.setCachedBulk(items));
  }

  public async get(id: string): Promise<T | undefined> {
    let rval: T | undefined = await this.CACHE.get(this.toKey(id));
    if (!rval && this.idIndex.includes(id)) {
      rval = ((await this.getCachedBulk()) || {})[id];
    }
    if (!rval) {
      this.LOG.trace(`[${this.repoName}] Cache miss: `, id);
    }
    return rval;
  }

  public async put(item: T): Promise<T> {
    const id = this.descriptor.getId(item);
    await this.CACHE.put<T>(this.toKey(id), item, this.cacheTTL);
    const rval = (await this.CACHE.get<T>(this.toKey(id)))!;
    if (!rval) {
      throw new Error(`[${this.repoName}] Failed to cache item: ${id}`);
    }
    if (!this.idIndex.includes(id)) {
      this.idIndex.push(id);
    }
    const cachedItems = await this.getCachedBulk();
    if (cachedItems) {
      cachedItems[id] = rval;
      await this.setCachedBulk(cachedItems);
    }
    this.LOG.trace(`[${this.repoName}] Added to cache[${id}]: `, rval);
    return rval;
  }

  public async remove(id: string): Promise<T | undefined> {
    let rval: T | undefined = await this.get(id);
    if (this.idIndex.includes(id)) {
      const index = this.idIndex.indexOf(id);
      this.idIndex.splice(index, 1);
    }
    const cachedItems = await this.getCachedBulk();
    if (cachedItems) {
      rval = cachedItems[id];
      delete cachedItems[id];
      await this.setCachedBulk(cachedItems);
    }
    await this.CACHE.remove(this.toKey(id));
    if (rval) {
      this.LOG.trace(`[${this.repoName}] Removed from cache: `, id);
    }
    return rval;
  }

  protected async setCachedBulk(itemsOrCache: T[] | CachedItems<T>): Promise<CachedItems<T>> {
    const rval: CachedItems<T> = Array.isArray(itemsOrCache)
      ? itemsOrCache.reduce((cachedItems, item) => {
          const id = this.descriptor.getId(item);
          if (!this.idIndex.includes(id)) {
            this.idIndex.push(id);
          }
          cachedItems[id] = item;
          return cachedItems;
        }, {})
      : itemsOrCache;
    this.LOG.debug(`[${this.repoName}] Bulk cache added[${this.cacheKey}]: `, Object.keys(rval).length);
    await this.CACHE.put(this.cacheKey, rval, this.cacheTTL);
    return rval;
  }

  protected async getCachedBulk(): Promise<CachedItems<T> | undefined> {
    return await this.CACHE.get(this.cacheKey);
  }

  private toKey(key: string): string {
    return `${this.repoName}:${key}`;
  }
}
