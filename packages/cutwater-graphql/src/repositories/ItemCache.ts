import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { ItemDescriptor } from './ItemDescriptor';

export interface CacheConfig<T> {
  repoName: string;
  cacheId: string;
  itemDescriptor: ItemDescriptor<T>;
  ttl?: number;
}

type CachedItems<T> = Record<string, T>;

export class ItemCache<T> {
  public readonly CACHE_ID: string;

  protected readonly LOG: Logger = LoggerFactory.getLogger();

  private readonly INDEX: string[] = [];
  private readonly CACHE_KEY: string;
  private readonly REPO_NAME: string;
  private readonly CACHE_TTL: number;
  private readonly DESCRIPTOR: ItemDescriptor<T>;

  public constructor(
    private readonly CACHE: InMemoryLRUCache,
    { repoName, cacheId, itemDescriptor, ttl }: CacheConfig<T>,
  ) {
    this.CACHE_KEY = this.toKey(`${cacheId}_CACHE`);
    this.REPO_NAME = repoName;
    this.CACHE_ID = cacheId;
    this.DESCRIPTOR = itemDescriptor;
    this.CACHE_TTL = ttl || 90;
  }

  public includes(id: string): boolean {
    return this.INDEX.includes(id);
  }

  public async getAll(): Promise<T[]> {
    return Object.values((await this.getCachedBulk()) || {});
  }

  public async putAll(items: T[]): Promise<T[]> {
    return Object.values(await this.setCachedBulk(items));
  }

  public async get(id: string): Promise<T | undefined> {
    let rval: T | undefined;
    const rawValue = await this.CACHE.get(this.toKey(id));
    if (!rawValue && this.INDEX.includes(id)) {
      rval = ((await this.getCachedBulk()) || {})[id];
    } else if (rawValue) {
      rval = JSON.parse(rawValue);
    }
    return rval;
  }

  public async put(item: T): Promise<T> {
    const id = this.DESCRIPTOR.getId(item);
    await this.CACHE.set(this.toKey(id), JSON.stringify(item), { ttl: this.CACHE_TTL });
    if (!this.INDEX.includes(id)) {
      this.INDEX.push(id);
      const cachedItems = await this.getCachedBulk();
      if (cachedItems) {
        cachedItems[id] = item;
        await this.setCachedBulk(cachedItems);
      }
    }
    this.LOG.debug(`Added id to cache: `, id);
    return item;
  }

  public async remove(id: string): Promise<T | undefined> {
    let rval: T | undefined;
    if (this.INDEX.includes(id)) {
      delete this.INDEX[id];
      const cachedItems = await this.getCachedBulk();
      if (cachedItems) {
        rval = cachedItems[id];
        delete cachedItems[id];
        await this.setCachedBulk(cachedItems);
      }
    } else {
      rval = await this.get(id);
    }
    await this.CACHE.delete(this.toKey(id));
    return rval;
  }

  protected async setCachedBulk(itemsOrCache: T[] | CachedItems<T>): Promise<CachedItems<T>> {
    const rval: CachedItems<T> = Array.isArray(itemsOrCache)
      ? itemsOrCache.reduce((cachedItems, item) => {
          const id = this.DESCRIPTOR.getId(item);
          if (!this.INDEX.includes(id)) {
            this.INDEX.push(id);
          }
          cachedItems[id] = item;
          return cachedItems;
        }, {})
      : itemsOrCache;
    await this.CACHE.set(this.CACHE_KEY, JSON.stringify(rval), { ttl: this.CACHE_TTL });
    return rval;
  }

  protected async getCachedBulk(): Promise<CachedItems<T> | undefined> {
    const rawValue = await this.CACHE.get(this.CACHE_KEY);
    return rawValue ? JSON.parse(rawValue) : undefined;
  }

  private toKey(key: string): string {
    return `${this.REPO_NAME}:${key}`;
  }
}