import { MemoryCache } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemDescriptor } from '../types';

export interface CacheConfig<T> {
  repoName: string;
  cacheId: string;
  itemDescriptor: ItemDescriptor<T>;
  ttl?: number;
}

export class ItemCache<T> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();

  public readonly cacheId: string;
  private readonly idIndex: string[] = [];
  private readonly cacheKey: string;
  private readonly repoName: string;
  private readonly cacheTTL: number;
  private readonly descriptor: ItemDescriptor<T>;

  public constructor(
    private readonly memCache: MemoryCache,
    { itemDescriptor, repoName, cacheId, ttl }: CacheConfig<T>,
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

  public async isGetAllReady(): Promise<boolean> {
    return await this.memCache.containsKey(this.cacheKey);
  }

  public async getAll(): Promise<T[]> {
    const bulkIds = (await this.getCachedBulk()) || [];
    const rval: T[] = [];
    for (const id of bulkIds) {
      const item = await this.get(id);
      if (item) {
        rval.push(item);
      } else {
        this.LOG.warn(`[${this.repoName}] Missing getAll id: ${id}`);
      }
    }
    return rval;
  }

  public async putAll(items: T[]): Promise<T[]> {
    const rval: T[] = [];
    for (const item of items) {
      rval.push(await this.cache(item));
    }
    await this.setCachedBulk(rval);
    return rval;
  }

  public async get(id: string): Promise<T | undefined> {
    const rval: T | undefined = await this.memCache.get<T>(this.toKey(id));
    if (!rval) {
      this.LOG.trace(`[${this.repoName}] Cache miss: `, id);
    }
    return rval;
  }

  public async put(item: T): Promise<T> {
    const id = this.descriptor.getId(item);
    const rval = this.cache(item);
    const cachedItems = await this.getCachedBulk();
    if (cachedItems && !cachedItems.includes(id)) {
      cachedItems.push(id);
      await this.setCachedBulk(cachedItems);
    }
    this.LOG.trace(`[${this.repoName}] Added to cache[${id}]: `, item);
    return rval;
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.get(id);
    if (this.idIndex.includes(id)) {
      const i = this.idIndex.indexOf(id);
      this.idIndex.splice(i, 1);
      const cachedItems = await this.getCachedBulk();
      if (cachedItems && cachedItems.includes(id)) {
        await this.setCachedBulk(cachedItems.filter(el => el !== id));
      }
    }
    await this.memCache.remove(this.toKey(id));
    if (rval) {
      this.LOG.trace(`[${this.repoName}] Removed from cache: `, id);
    }
    return rval;
  }

  protected async cache(item: T): Promise<T> {
    const id = this.descriptor.getId(item);
    await this.memCache.put<T>(this.toKey(id), item, this.cacheTTL);
    const rval = await this.memCache.get<T>(this.toKey(id));
    if (!rval) {
      throw new Error(`Failed to add item to cache: ${JSON.stringify(item)}`);
    }
    if (!this.idIndex.includes(id)) {
      this.idIndex.push(id);
    }
    this.LOG.trace(`[${this.repoName}] Added to cache[${id}]: `, item);
    return rval!;
  }

  protected async setCachedBulk(itemsOrIds: T[] | string[]): Promise<string[]> {
    const rval: string[] = itemsOrIds.map(item => {
      return typeof item === 'string' ? item : this.descriptor.getId(item);
    });
    this.LOG.debug(`[${this.repoName}] Bulk cache added: `, rval.length);
    await this.memCache.put(this.cacheKey, rval, this.cacheTTL);
    return rval;
  }

  protected async getCachedBulk(): Promise<string[] | undefined> {
    return await this.memCache.get(this.cacheKey);
  }

  private toKey(key: string): string {
    return `${this.repoName}:${key}`;
  }
}
