import { MemoryCache } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemDescriptor } from './ItemDescriptor';

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
    this.cacheKey = this.toKey(`${cacheId}_CACHE`);
    this.repoName = repoName;
    this.cacheId = cacheId;
    this.descriptor = itemDescriptor;
    this.cacheTTL = ttl || 90;
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
      this.LOG.trace(`[${this.repoName}] - Cache miss: `, id);
    }
    return rval;
  }

  public async put(item: T): Promise<T> {
    const id = this.descriptor.getId(item);
    await this.CACHE.put(this.toKey(id), item, this.cacheTTL);
    if (!this.idIndex.includes(id)) {
      this.idIndex.push(id);
      const cachedItems = await this.getCachedBulk();
      if (cachedItems) {
        cachedItems[id] = item;
        await this.setCachedBulk(cachedItems);
      }
    }
    this.LOG.trace(`[${this.repoName}] - Added to cache[${id}]: `, item);
    return item;
  }

  public async remove(id: string): Promise<T | undefined> {
    let rval: T | undefined;
    if (this.idIndex.includes(id)) {
      delete this.idIndex[id];
      const cachedItems = await this.getCachedBulk();
      if (cachedItems) {
        rval = cachedItems[id];
        delete cachedItems[id];
        await this.setCachedBulk(cachedItems);
      }
    } else {
      rval = await this.get(id);
    }
    await this.CACHE.remove(this.toKey(id));
    if (rval) {
      this.LOG.trace(`[${this.repoName}] - Removed from cache: `, id);
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
    this.LOG.debug(`[${this.repoName}] - Bulk cache added[${this.cacheKey}]: `, Object.keys(rval).length);
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
