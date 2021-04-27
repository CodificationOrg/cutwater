import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { DynamoDB } from 'aws-sdk';
import {
  AttributeMap,

  GetItemOutput,
  PutItemInput,
  QueryInput,
  QueryOutput
} from 'aws-sdk/clients/dynamodb';
import { ItemRepository } from '../types';

export interface DynamoDBItemTableConfig {
  tableName: string;
  typeIndex: string;
  idKey: string;
  typeKey: string;
}

export interface DynamoDBItemConverter<T> {
  convertToItem(map: AttributeMap): Promise<T>;
  convertToAttributeMap(item: T): Promise<AttributeMap>;
}

export interface DynamoDBItemRepositoryConfig<T> {
  db?: DynamoDB;
  nodeType: string;
  tableConfig: DynamoDBItemTableConfig;
  idProperty: string;
  parentIdProperty?: string;
  converter: DynamoDBItemConverter<T>
}

export abstract class AbstractDynamoDBRepository<T> implements ItemRepository<T> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly db: DynamoDB = new DynamoDB();

  public constructor(
    public readonly config: DynamoDBItemRepositoryConfig<T>
  ) {
    Object.freeze(config);
    this.db = config.db || new DynamoDB();
  }

  public async getAll(parentId: string): Promise<T[]> {
    const results: AttributeMap[] = await this.getAllMaps(parentId);
    return results.map(item => this.dynamoToItem(new DynamoItem(item)));
  }

  public async get(id: string): Promise<T | undefined> {
    const result: GetItemOutput = await this.db
      .getItem(this.toItemInput(this.toPartitionKey(id)))
      .promise();
    return result.Item ? this.attributeMapToItem(result.Item) : undefined;
  }

  public async put(item: T): Promise<T> {
    const params: PutItemInput = {
      Item: await this.config.converter.convertToAttributeMap(item),
      ...this.toBaseInput(),
    };
    await this.db.putItem(params).promise();
    return item;
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.get(id);
    if (rval) {
      await this.db.deleteItem(this.toItemInput(this.toPartitionKey(id))).promise();
    }
    return rval;
  }

  public toItemInput(paritionKey: string): any {
    const rval = {
      Key: {
        [this.config.getLookup.primaryKey]: {
          S: paritionKey,
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

  protected toPartitionValue(id: string): string {
    return `${this.config.nodeType}#${id}`;
  }

  protected toId(partitionKey: string): string {
    return partitionKey.split('#')[1].trim();
  }

  protected async attributeMapToItem(attributeMap: AttributeMap): Promise<T> {
    attributeMap[this.config.idAttribute].S = this.toId(attributeMap[this.config.idAttribute].S!);
    attributeMap[this.config.getAllConfig.sortKey] = item.toStringPart(SORT_KEY, 1);
    const rval = await this.config.converter.convertToItem(attributeMap);
    return (rval as unknown) as T;
  }

  protected async itemToAttributeMap(item: T): Promise<AttributeMap> {
    const rval = await this.config.converter.convertToAttributeMap(item);
    rval[this.config.tableConfig.idKey] = {
      S: this.toPartitionValue(item[this.config.idProperty])
    }
    let typeValue;
    if (this.config.parentIdProperty) {
      typeValue = this.toPartitionValue(item[this.config.parentIdProperty]);
    } else {
      typeValue = this.config.nodeType;
    }
    rval[this.config.tableConfig.typeKey] = {
      S: typeValue
    }
    return rval;
  }

  protected async getAllMaps(parentId?: string, cursor?: string): Promise<AttributeMap[]> {
    const partitionKey = parentId ? this.toPartitionKey(parentId) : this.config.nodeType;
    const params: QueryInput = {
      ExpressionAttributeValues: {
        ':partition': {
          S: partitionKey,
        },
      },
      KeyConditionExpression: `${this.config.getAllConfig.primaryKey} = :partition`,
      IndexName: this.config.getAllConfig.index,
      ...this.toBaseInput(),
    };
    if (cursor) {
      params.ExclusiveStartKey = {
        [this.config.getAllConfig.primaryKey]: { S: partitionKey },
        [this.config.getAllConfig.sortKey]: { S: cursor },
      };
    }

    let result: QueryOutput;
    try {
      result = await this.db.query(params).promise();
      if (!result || !result.Items) {
        return [];
      }
    } catch (err) {
      this.LOG.error('Encountered error during query: ', params);
      return [];
    }

    const rval = result.Items;
    if (result.LastEvaluatedKey) {
      const moreResults = await this.getAllMaps(parentId, result.LastEvaluatedKey[this.config.getAllConfig.sortKey].S!);
      for (const m of moreResults) {
        rval.push(m);
      }
    }

    return rval;
  }
}
