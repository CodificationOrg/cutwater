import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemRepository } from '@codification/cutwater-repo';
import { CompoundItemId } from '../../dynamodb';
import { S3Bucket } from '../S3Bucket';
import { CompoundItemS3RepositoryConfig } from './CompoundItemS3RepositoryConfig';

type ItemStore<T> = Record<string, T>;
type SerializedStore = Record<string, string>;

export class CompoundItemS3Repository<T> implements ItemRepository<T> {
  private static readonly ROOT_ID = 'ROOT';

  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly s3: S3Bucket;

  public constructor(public readonly config: CompoundItemS3RepositoryConfig<T>) {
    this.s3 = new S3Bucket(config.bucketName, config.s3);
  }

  public get itemType() {
    return this.config.itemType;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    return Object.values(await this.loadItemStore(parentId));
  }

  public async get(id: string): Promise<T | undefined> {
    const itemId = CompoundItemId.fromItemId(id);
    return Object.values(await this.loadItemStore(itemId.parentId))[itemId.name];
  }

  public async put(item: T): Promise<T> {
    return (await this.putAll([item]))[0];
  }

  public async putAll(items: T[]): Promise<T[]> {
    const rval: T[] = [];
    const parentGroups = items.reduce<Record<string, T[]>>((groups, item) => {
      const parentId = CompoundItemId.fromItemId(item[this.config.idProperty]).parentId || CompoundItemS3Repository.ROOT_ID;
      const items = groups[parentId] || [];
      items.push(item);
      groups[parentId] = items;
      return groups;
    }, {});
    const parentIds = Object.keys(parentGroups);
    for (const parentId of parentIds) {
      rval.push(... (await this.putAllByParentId(parentId, parentGroups[parentId])));
    }
    return rval;
  }

  protected async putAllByParentId(parentId: string, items: T[]): Promise<T[]> {
    const itemIds = items.map(item => item[this.config.idProperty]);
    const itemNames = itemIds.map(id => CompoundItemId.fromItemId(id).name);
    const store = await this.loadItemStore(parentId);
    items.forEach((item, i) => {
      store[itemNames[i]] = item;
    });
    return Object.values(await this.storeItemStore(parentId, store)).filter(item => itemIds.includes(item[this.config.idProperty]));
  }

  public async remove(id: string): Promise<T | undefined> {
    const itemId = CompoundItemId.fromItemId(id);
    const parentId = itemId.parentId || CompoundItemS3Repository.ROOT_ID;
    const store = await this.loadItemStore(parentId);
    const rval = store[itemId.name];
    if (rval) {
      delete store[itemId.name];
      await this.storeItemStore(parentId, store);
    }
    return rval;
  }

  public async removeAll(ids: string[]): Promise<string[]> {
    const rval: string[] = [];
    const parentGroups = ids.reduce<Record<string, string[]>>((groups, id) => {
      const itemId = CompoundItemId.fromItemId(id);
      const parentId = itemId.parentId || CompoundItemS3Repository.ROOT_ID;
      const names = groups[parentId] || [];
      names.push(itemId.name);
      groups[parentId] = names;
      return groups;
    }, {});
    const parentIds = Object.keys(parentGroups);
    for (const parentId of parentIds) {
      rval.push(... (await this.removeAllByParentId(parentId, parentGroups[parentId])));
    }
    return rval;;
  }

  protected async removeAllByParentId(parentId: string, names: string[]): Promise<string[]> {
    const store = await this.loadItemStore(parentId);
    const rval = names.filter(name => store[name] !== undefined);
    if (rval.length > 0) {
      rval.forEach(name => delete store[name]);
      await this.storeItemStore(parentId, store);
    }
    return rval.map(name => CompoundItemId.create(parentId, name).itemId);
  }

  protected async loadItemStore(parentId = CompoundItemS3Repository.ROOT_ID): Promise<ItemStore<T>> {
    try {
      const buffer = await this.s3.loadBuffer(this.toFilename(parentId));
      return this.deserializeAll(buffer);
    } catch (err) {
      this.LOG.warn('Error loading item store for id: ', parentId, err);
    }
    return {};
  }

  protected async storeItemStore(parentId = CompoundItemS3Repository.ROOT_ID, itemStore: ItemStore<T>): Promise<ItemStore<T>> {
    try {
      await this.s3.store(this.toFilename(parentId), this.serializeAll(itemStore));
      return this.loadItemStore(parentId);
    } catch (err) {
      this.LOG.warn('Error storing item store for id: ', parentId, err);
    }
    return {};
  }

  protected deserialize(serialized: string): T {
    if (this.config.deserialize) {
      return this.config.deserialize(serialized);
    }
    return JSON.parse(serialized);
  }

  protected serialize(item: T): string {
    if (this.config.serialize) {
      return this.config.serialize(item);
    }
    return JSON.stringify(item);
  }

  protected deserializeAll(buffer: Buffer): ItemStore<T> {
    const store: SerializedStore = JSON.parse(buffer.toString('utf-8'));
    const rval = Object.keys(store).reduce<ItemStore<T>>((itemStore, key) => {
      itemStore[key] = this.deserialize(store[key]);
      return itemStore;
    }, {});
    return rval;
  }

  protected serializeAll(itemStore: ItemStore<T>): string {
    const rval = Object.keys(itemStore).reduce<SerializedStore>((store, key) => {
      store[key] = this.serialize(itemStore[key]);
      return store;
    }, {});
    return JSON.stringify(rval);
  }

  private toFilename(parentId: string): string {
    return CompoundItemId.fromItemId(parentId).idParts.join('/') + '.json';
  }
}