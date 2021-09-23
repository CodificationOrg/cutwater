import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
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

  public getId(item: T): string {
    return item[this.config.idProperty];
  }

  public getParentId(item: T): string | undefined {
    return this.getId(item)
      .split(':')
      .slice(0, -1)
      .join(':');
  }

  public toPartitionValue(id: string): string {
    return id
      .split(':')
      .slice(0, -1)
      .join('#');
  }

  public toSortKeyValue(id: string): string {
    return this.config.nodeType + '#' + id.split(':').pop();
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
    return this.partitionValue.split('#').join(':') + ':' + this.sortKeyValue.split('#').pop();
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
