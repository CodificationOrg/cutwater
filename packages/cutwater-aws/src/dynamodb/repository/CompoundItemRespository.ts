import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemRepository } from '@codification/cutwater-repo';
import { DynamoDB } from 'aws-sdk';
import { AttributeMap, GetItemOutput, PutItemInput, QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { CompoundKey } from '.';
import { DynamoItem } from '..';
import { CompoundItemId } from './CompoundItemId';
import { CompoundItemRepositoryConfig } from './CompoundItemRepositoryConfig';

export class CompoundItemRepository<T> implements ItemRepository<T> {
  private static readonly ROOT_PARTITION_KEY = '#ROOT#';

  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly db: DynamoDB = new DynamoDB();

  public constructor(public readonly config: CompoundItemRepositoryConfig<T>) {
    this.db = config.db || new DynamoDB();
  }

  public get itemType() {
    return this.config.itemType;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    const partitionValue = parentId ? CompoundKey.toPartitionKey(parentId) : CompoundItemRepository.ROOT_PARTITION_KEY;
    const results: AttributeMap[] = await this.getAllMaps(partitionValue);
    const rval: T[] = [];
    for (const item of results) {
      rval.push(this.attributeMapToItem(item));
    }
    return rval;
  }

  public async get(id: string): Promise<T | undefined> {
    const params = this.toItemInput(id);
    this.LOG.trace('DynamoDB Get: ', params);
    const result: GetItemOutput = await this.db.getItem(params).promise();
    if (!result.Item) {
      this.LOG.trace('No result.');
    }
    return result.Item ? this.attributeMapToItem(result.Item) : undefined;
  }

  public async put(item: T): Promise<T> {
    const params: PutItemInput = {
      Item: await this.itemToAttributeMap(item),
      ...this.baseInput,
    };
    this.LOG.trace('DynamoDB Put: ', params);
    await this.db.putItem(params).promise();
    return item;
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.get(id);
    if (rval) {
      const params = this.toItemInput(id);
      this.LOG.trace('DynamoDB Delete: ', params);
      await this.db.deleteItem(params).promise();
    }
    return rval;
  }

  public toItemInput(id: string): any {
    const key = CompoundKey.fromItemId(this.itemType, id);
    const rval = {
      Key: {
        [this.config.partitionKey]: {
          S: key.partitionKey,
        },
        [this.config.sortKey]: {
          S: key.sortKey,
        },
      },
      ...this.baseInput,
    };
    return rval;
  }

  private get baseInput() {
    return {
      TableName: this.config.tableName,
    };
  }

  protected attributeMapToItem(map: AttributeMap): T {
    const dynamoItem = new DynamoItem(map);
    const rval = this.config.toItem(map);
    rval[this.config.idProperty] = CompoundItemId.fromKeys(
      dynamoItem.toString(this.config.partitionKey)!,
      dynamoItem.toString(this.config.sortKey)!,
    ).itemId;
    return rval;
  }

  protected async itemToAttributeMap(item: T): Promise<AttributeMap> {
    const key = CompoundKey.fromItemId(this.itemType, item[this.config.idProperty]);
    const rval = new DynamoItem(this.config.toAttributeMap(item));
    rval.setString(this.config.partitionKey, key.partitionKey);
    rval.setString(this.config.sortKey, key.sortKey);
    return rval.item;
  }

  protected async getAllMaps(partitionValue: string, cursor?: string): Promise<AttributeMap[]> {
    const params: QueryInput = {
      ExpressionAttributeValues: {
        ':partitionValue': {
          S: partitionValue,
        },
        ':itemType': {
          S: this.config.itemType,
        },
      },
      KeyConditionExpression: `${this.config.partitionKey} = :partitionValue and begins_with(${this.config.sortKey}, :itemType)`,
      ...this.baseInput,
    };
    if (cursor) {
      params.ExclusiveStartKey = {
        [this.config.partitionKey]: { S: partitionValue },
        [this.config.sortKey]: { S: cursor },
      };
    }

    this.LOG.trace('DynamoDB GetAll: ', params);
    let result: QueryOutput;
    try {
      result = await this.db.query(params).promise();
      if (!result || !result.Items) {
        return [];
      }
    } catch (err) {
      this.LOG.error(`Encountered error during query[${JSON.stringify(params)}]: `, err);
      return [];
    }

    const rval = result.Items;
    if (result.LastEvaluatedKey) {
      const moreResults = await this.getAllMaps(partitionValue, result.LastEvaluatedKey[this.config.sortKey].S!);
      for (const m of moreResults) {
        rval.push(m);
      }
    }

    return rval;
  }
}
