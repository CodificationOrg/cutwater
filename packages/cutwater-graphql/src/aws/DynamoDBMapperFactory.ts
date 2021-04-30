import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { ItemDescriptor } from '../repositories';

export interface DynamoDBMap<T> {
  id: string;
  parentId?: string;
  partition: string;
  typeOrParent: string;
  item: T;
  map: AttributeMap;
}

export interface DynamoDBMapperConfig<T> {
  readonly nodeType: string;
  readonly idProperty: string;
  readonly parentIdProperty?: string;
  toItem(map: AttributeMap): T;
  toAttributeMap(item: T): AttributeMap;
}

export interface DynamoDBMapper<T> extends ItemDescriptor<T> {
  idKey: string;
  typeKey: string;
  config: DynamoDBMapperConfig<T>;
  create(item: T | AttributeMap): DynamoDBMap<T>;
  toPartitionValue(id: string): string;
  toTypeValue(parentId?: string): string;
}

export class DynamoDBMapperFactory {
  public constructor(public readonly idKey: string, public readonly typeKey: string) {}

  public create<T>(config: DynamoDBMapperConfig<T>): DynamoDBMapper<T> {
    return new ConfiguredDynamoDBMapper<T>(this, config);
  }
}

class ConfiguredDynamoDBMapper<T> implements DynamoDBMapper<T> {
  public constructor(private factory: DynamoDBMapperFactory, public config: DynamoDBMapperConfig<T>) {}

  public get idKey(): string {
    return this.factory.idKey;
  }

  public get typeKey(): string {
    return this.factory.typeKey;
  }

  public create(item: T | AttributeMap): DynamoDBMap<T> {
    return new DynamoDBMapImp<T>(item, this);
  }

  public getId(item: T): string {
    return item[this.config.idProperty];
  }

  public getParentId(item: T): string | undefined {
    return this.config.parentIdProperty ? item[this.config.parentIdProperty] : undefined;
  }

  public toPartitionValue(id: string): string {
    return `${this.config.nodeType}#${id}`;
  }

  public toTypeValue(parentId?: string): string {
    return `${this.config.nodeType}${parentId ? '#' + parentId : ''}`;
  }
}

class DynamoDBMapImp<T> implements DynamoDBMap<T> {
  private readonly dynamoItem: DynamoItem;

  public constructor(root: T | AttributeMap, private readonly mapper: DynamoDBMapper<T>) {
    const partitionValue = root[mapper.idKey];
    if (partitionValue && typeof partitionValue === 'object') {
      this.dynamoItem = new DynamoItem(root as AttributeMap);
    } else {
      this.dynamoItem = new DynamoItem();
      this.populateDynamoItem(root as T);
    }
  }

  public get id(): string {
    return this.dynamoItem.toStringPart(this.mapper.idKey, 1)!;
  }

  public get parentId(): string | undefined {
    return this.mapper.config.parentIdProperty ? this.dynamoItem.toStringPart(this.mapper.typeKey, 1) : undefined;
  }

  public get partition(): string {
    return this.dynamoItem.item[this.mapper.idKey].S!;
  }

  public get typeOrParent(): string {
    return this.dynamoItem.item[this.mapper.typeKey].S!;
  }

  public get item(): T {
    return this.populateIds(this.mapper.config.toItem(this.dynamoItem.item));
  }

  public get map(): AttributeMap {
    return this.dynamoItem.item;
  }

  private populatePartitionKeys(item: T): void {
    this.dynamoItem.setStringParts(this.mapper.idKey, this.mapper.config.nodeType, this.mapper.getId(item));
    this.dynamoItem.setStringParts(this.mapper.typeKey, this.mapper.config.nodeType, this.mapper.getParentId(item));
  }

  private populateDynamoItem(item: T): void {
    this.dynamoItem.item = this.mapper.config.toAttributeMap(item);
    this.populatePartitionKeys(item);
  }

  protected populateIds(item: T): T {
    item[this.mapper.config.idProperty] = this.id;
    if (this.mapper.config.parentIdProperty) {
      item[this.mapper.config.parentIdProperty] = this.parentId;
    }
    return item;
  }
}
