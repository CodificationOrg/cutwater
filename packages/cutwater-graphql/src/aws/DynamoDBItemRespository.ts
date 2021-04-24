import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { DynamoDB } from 'aws-sdk';
import {
  AttributeMap,
  GetItemInput,
  GetItemOutput,
  PutItemInput,
  QueryInput,
  QueryOutput
} from 'aws-sdk/clients/dynamodb';
import { NodeId } from '../core';
import { NodeItemDescriptor } from '../repositories';
import { ItemRepository } from '../types';

export interface LookupConfig {
  index?: string;
  primaryKey: string;
  sortKey?: string;
}

export interface RepositoryConfig {
  db?: DynamoDB;
  tableName: string;
  nodeType: string;
  idProperty: string;
  parentIdProperty?: string;
}

export abstract class AbstractDynamoDBRepository<T> implements ItemRepository<T>, NodeItemDescriptor<T> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly db: DynamoDB = new DynamoDB();

  public constructor(
    public readonly config: RepositoryConfig
  ) {
    Object.freeze(config);
    this.db = config.db || new DynamoDB();
  }

  public getId(item: T): string {
    return item[this.config.idProperty];
  }

  public getParentId(item: T): string | undefined {
    return this.config.parentIdProperty ? item[this.config.parentIdProperty] : undefined;
  }

  public getItemId(nodeId: NodeId): string {
    return nodeId.clearId;
  }

  public getItemParentId(nodeId?: NodeId): string | undefined {
    return nodeId ? nodeId.clearId : undefined;
  }

  public getObjectId(item: T): string {
    return NodeId.from(this.getId(item)).objectId;
  }

  public getParentObjectId(item: T): string | undefined {
    const parentId = this.getParentId(item);
    return parentId ? NodeId.from(parentId).objectId : undefined;
  }

  public async getAll(parentId: string): Promise<T[]> {
    const results: AttributeMap[] = await this.getAllMaps(parentId);
    return results.map(item => this.dynamoToItem(new DynamoItem(item)));
  }

  public async get(id: string): Promise<T | undefined> {
    const result: GetItemOutput = await this.db
      .getItem(this.toItemInput(formatValue(this.config.type, pk), consistent))
      .promise();
    return result.Item ? this.dynamoToItem(new DynamoItem(result.Item)) : undefined;
  }

  public async put(item: T): Promise<T> {
    const params: PutItemInput = {
      Item: this.itemToDynamo(item).prune(),
      ...this.toBaseInput(),
    };
    await this.db.putItem(params).promise();
    return item;
  }

  public async remove(pk: string): Promise<T | undefined> {
    const rval = await this.get(pk);
    if (rval) {
      await this.db.deleteItem(this.toItemInput(rval[this.config.primaryKey])).promise();
    }
    return rval;
  }

  public toItemInput(paritionKey: string, consistent: boolean = false): any {
    const rval = {
      Key: {
        [PARTITION_KEY]: {
          S: paritionKey,
        },
      },
      ...this.toBaseInput(),
    };
    if (consistent) {
      (rval as GetItemInput).ConsistentRead = true;
    }
    return rval;
  }

  public toBaseInput() {
    return {
      TableName: this.tableName,
    };
  }

  protected dynamoToItem(item: DynamoItem): T {
    const rval = {
      [this.config.primaryKey]: item.toStringPart(PARTITION_KEY, 1),
    };
    if (this.config.sortKey) {
      rval[this.config.sortKey] = item.toStringPart(SORT_KEY, 1);
    }
    return (rval as unknown) as T;
  }

  protected itemToDynamo(item: T): DynamoItem {
    const rval: DynamoItem = new DynamoItem();
    rval.setStringParts(PARTITION_KEY, this.config.type, item[this.config.primaryKey]);
    if (this.config.sortKey) {
      rval.setStringParts(SORT_KEY, this.config.type, item[this.config.sortKey]);
    }
    return rval;
  }

  protected async getAllMaps(parentId: string, cursor?: string): Promise<AttributeMap[]> {
    const params: QueryInput = {
      ExpressionAttributeValues: {
        ':partition': {
          S: formatValue(this.config.type, parentId),
        },
      },
      KeyConditionExpression: `${DOMAIN_GSI_PK} = :partition`,
      IndexName: DOMAIN_GSI,
      ...this.toBaseInput(),
    };
    if (cursor) {
      params.ExclusiveStartKey = {
        [DOMAIN_GSI_PK]: { S: formatValue(this.config.type, parentId) },
        [DOMAIN_GSI_SK]: { S: formatValue(this.config.type, cursor) },
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
      const newCursor = parseValue(result.LastEvaluatedKey[DOMAIN_GSI_SK].S!)[1];
      const moreResults = await this.getAllMaps(parentId, newCursor);
      for (const m of moreResults) {
        rval.push(m);
      }
    }

    return rval;
  }
}
