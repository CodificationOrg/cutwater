import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { CompoundKey } from '.';
import { CompoundMap } from './CompoundMap';
import { CompoundMapper } from './CompoundMapper';
import { CompoundMapperConfig } from './CompoundMapperConfig';

export class CompoundMapperFactory {
  public constructor(public readonly partitionKey: string, public readonly sortKey: string) {}

  public create<T>(config: CompoundMapperConfig<T>): CompoundMapper<T> {
    return new ConfiguredCompoundMapper<T>(this, config);
  }
}

class ConfiguredCompoundMapper<T> implements CompoundMapper<T> {
  public constructor(private factory: CompoundMapperFactory, public config: CompoundMapperConfig<T>) {}

  public get partitionKey(): string {
    return this.factory.partitionKey;
  }

  public get sortKey(): string {
    return this.factory.sortKey;
  }

  public create(item: T | AttributeMap): CompoundMap<T> {
    return new CompoundMapImp<T>(item, this);
  }

  private toCompoundKey(itemOrId: T | string): CompoundKey {
    const itemId = typeof itemOrId === 'string' ? itemOrId : this.getId(itemOrId);
    return CompoundKey.fromItemId(this.config.nodeType, itemId);
  }

  public getId(item: T): string {
    return item[this.config.idProperty];
  }

  public getParentId(item: T): string | undefined {
    return this.toCompoundKey(item).parentItemId;
  }

  public toPartitionValue(id: string): string {
    return this.toCompoundKey(id).partitionValue;
  }

  public toSortKeyValue(id: string): string {
    return this.toCompoundKey(id).sortKeyValue;
  }
}

class CompoundMapImp<T> implements CompoundMap<T> {
  private readonly dynamoItem: DynamoItem;

  public constructor(root: T | AttributeMap, private readonly mapper: CompoundMapper<T>) {
    const partitionValue = root[mapper.partitionKey];
    if (partitionValue && typeof partitionValue === 'object') {
      this.dynamoItem = new DynamoItem(root as AttributeMap);
    } else {
      this.dynamoItem = new DynamoItem();
      this.populateDynamoItem(root as T);
    }
  }

  public get id(): string {
    return CompoundKey.fromKey(this.partitionValue, this.sortKeyValue).itemId;
  }

  public get partitionValue(): string {
    return this.dynamoItem.item[this.mapper.partitionKey].S!;
  }

  public get sortKeyValue(): string {
    return this.dynamoItem.item[this.mapper.sortKey].S!;
  }

  public get item(): T {
    return this.populateId(this.mapper.config.toItem(this.dynamoItem.item));
  }

  public get map(): AttributeMap {
    return this.dynamoItem.item;
  }

  private populateCompoundKey(item: T): void {
    this.dynamoItem.setString(this.mapper.partitionKey, this.mapper.toPartitionValue(this.mapper.getId(item)));
    this.dynamoItem.setString(this.mapper.sortKey, this.mapper.toSortKeyValue(this.mapper.getId(item)));
  }

  private populateDynamoItem(item: T): void {
    this.dynamoItem.item = this.mapper.config.toAttributeMap(item);
    this.populateCompoundKey(item);
  }

  protected populateId(item: T): T {
    item[this.mapper.config.idProperty] = this.id;
    return item;
  }
}
