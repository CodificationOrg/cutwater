import { MemoryCache } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemDescriptor, ItemRepository } from '../types';
import { ItemCache } from './ItemCache';

export interface RepositoryConfig<T> {
  name: string;
  greedy?: boolean;
  itemDescriptor: ItemDescriptor<T>;
  ttl?: number;
}

type Cmd = () => Promise<void>;
type GetCallback<T> = (result?: T) => void;

export class CachingItemRepository<T> implements ItemRepository<T> {
  private static readonly ROOT_OBJECT_ID = 'ROOT_OBJECT_ID';
  protected readonly LOG: Logger = LoggerFactory.getLogger();

  public readonly name: string;

  private cmdQueue: Cmd[] = [];

  private readonly memCache: MemoryCache;
  private readonly greedy: boolean;
  private readonly descriptor: ItemDescriptor<T>;
  private readonly ttl: number;
  private readonly itemCaches: Record<string, ItemCache<T>> = {};

  public constructor(
    private readonly repo: ItemRepository<T>,
    { name, itemDescriptor, ttl, greedy = false }: RepositoryConfig<T>,
    cache: MemoryCache = new MemoryCache(),
  ) {
    this.name = name;
    this.descriptor = itemDescriptor;
    this.ttl = ttl || 90;
    this.memCache = cache;
    this.greedy = greedy;

    if (greedy) {
      setInterval(async () => {
        while (this.cmdQueue.length > 0) {
          await this.cmdQueue.shift()!();
        }
      }, 5);
    }
  }

  public get itemType(): string {
    return this.repo.itemType;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    let rval: T[] = await this.getAllCached(parentId);
    if (rval.length === 0) {
      rval = await this.cacheAll(await this.repo.getAll(parentId), parentId);
    }
    return rval;
  }

  public async get(id: string): Promise<T | undefined> {
    return new Promise<T | undefined>(res => {
      const cmd: Cmd = () =>
        this.doGet(id, result => {
          res(result);
        });
      if (this.greedy) {
        this.cmdQueue.push(cmd);
      } else {
        cmd();
      }
    });
  }

  private async doGet(id: string, callback: GetCallback<T>): Promise<void> {
    let rval: T | undefined = await this.getCached(id);
    if (!rval) {
      rval = await this.repo.get(id);
      if (rval) {
        await this.cache(rval);
        if (this.greedy) {
          await this.getAll(this.descriptor.getParentId(rval));
        }
      }
    }
    callback(rval);
  }

  public async put(item: T): Promise<T> {
    return await this.cache(await this.repo.put(item));
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.repo.remove(id);
    const itemCache = this.getItemCacheForItemId(id);
    if (itemCache) {
      await itemCache.remove(id);
    }
    return rval;
  }

  protected async cache(item: T): Promise<T> {
    return await this.getItemCache(this.descriptor.getParentId(item)).put(item);
  }

  protected async cacheAll(items: T[], parentId?: string): Promise<T[]> {
    return await await this.getItemCache(parentId).putAll(items);
  }

  protected async getCached(id: string): Promise<T | undefined> {
    const itemCache = this.getItemCacheForItemId(id);
    if (itemCache) {
      return await itemCache.get(id);
    }
    return undefined;
  }

  protected async getAllCached(parentId: string = CachingItemRepository.ROOT_OBJECT_ID): Promise<T[]> {
    return await this.getItemCache(parentId).getAll();
  }

  private getItemCache(parentId: string = CachingItemRepository.ROOT_OBJECT_ID): ItemCache<T> {
    let rval = this.itemCaches[parentId];
    if (!rval) {
      this.LOG.debug(`[${this.name}] - Creating cache for parentId: `, parentId);
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
    const parentId = Object.keys(this.itemCaches).find(parentId => this.itemCaches[parentId].includes(id));
    return parentId ? this.getItemCache(parentId) : undefined;
  }
}
