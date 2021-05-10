import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { DynamoDB } from 'aws-sdk';
import { AttributeMap, GetItemOutput, PutItemInput, QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { ItemRepository } from '../types';
import { DynamoDBMapper } from './DynamoDBMapperFactory';

export interface DynamoDBItemRepositoryConfig<T> {
  db?: DynamoDB;
  tableName: string;
  typeIndex: string;
  mapper: DynamoDBMapper<T>;
}

export class DynamoDBItemRepository<T> implements ItemRepository<T> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly db: DynamoDB = new DynamoDB();
  protected readonly mapper: DynamoDBMapper<T>;

  public constructor(public readonly config: DynamoDBItemRepositoryConfig<T>) {
    Object.freeze(config);
    this.db = config.db || new DynamoDB();
    this.mapper = config.mapper;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    const results: AttributeMap[] = await this.getAllMaps(parentId);
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
      ...this.toBaseInput(),
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
    const rval = {
      Key: {
        [this.mapper.idKey]: {
          S: this.mapper.toPartitionValue(id),
        },
      },
      ...this.toBaseInput(),
    };
    return rval;
  }

  public toBaseInput() {
    return {
      TableName: this.config.tableName,
    };
  }

  protected attributeMapToItem(map: AttributeMap): T {
    return this.mapper.create(map).item;
  }

  protected async itemToAttributeMap(item: T): Promise<AttributeMap> {
    return this.mapper.create(item).map;
  }

  protected async getAllMaps(parentId?: string, cursor?: string): Promise<AttributeMap[]> {
    const partitionValue = this.mapper.toTypeValue(parentId);
    const params: QueryInput = {
      ExpressionAttributeValues: {
        ':partition': {
          S: partitionValue,
        },
      },
      KeyConditionExpression: `${this.mapper.typeKey} = :partition`,
      IndexName: this.config.typeIndex,
      ...this.toBaseInput(),
    };
    if (cursor) {
      params.ExclusiveStartKey = {
        [this.mapper.typeKey]: { S: partitionValue },
        [this.mapper.idKey]: { S: cursor },
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
      const moreResults = await this.getAllMaps(parentId, result.LastEvaluatedKey[this.mapper.idKey].S!);
      for (const m of moreResults) {
        rval.push(m);
      }
    }

    return rval;
  }
}
