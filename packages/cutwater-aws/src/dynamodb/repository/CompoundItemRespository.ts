import {
  BatchWriteItemInput,
  BatchWriteItemOutput,
  DeleteRequest,
  DynamoDB,
  GetItemInput,
  GetItemOutput,
  PutItemInput,
  QueryInput,
  QueryOutput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { AsyncUtils } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { ItemRepository } from '@codification/cutwater-repo';

import { DynamoItem } from '../DynamoItem';
import { AttributeMap } from '../types';
import { CompoundItemRepositoryConfig } from './CompoundItemRepositoryConfig';
import { CompoundKey } from './CompoundKey';

export class CompoundItemRepository<T extends object> implements ItemRepository<T> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly db: DynamoDB = new DynamoDB();

  public constructor(public readonly config: CompoundItemRepositoryConfig<T>) {
    this.db = config.db || new DynamoDB();
  }

  public get itemType() {
    return this.config.itemType;
  }

  public async getAll(parentId?: string): Promise<T[]> {
    const partitionValue = parentId
      ? CompoundKey.toPartitionKey(parentId)
      : CompoundKey.DEFAULT_PARENT;
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
    const result: GetItemOutput = await this.db.getItem(params);
    if (!result.Item) {
      this.LOG.trace('No result.');
    }
    return result.Item ? this.attributeMapToItem(result.Item) : undefined;
  }

  private toId(item: T | DynamoItem): string {
    if (item instanceof DynamoItem) {
      return CompoundKey.fromAttributeMap(item.item).compoundItemId.itemId;
    }
    return item[this.config.idProperty as keyof T] as string;
  }

  private async refreshItem(item: T): Promise<T> {
    return this.attributeMapToItem(await this.itemToAttributeMap(item));
  }

  public async put(item: T): Promise<T> {
    const attributeMap = await this.itemToAttributeMap(item);
    const params: PutItemInput = {
      Item: attributeMap,
      ...this.baseInput,
    };
    this.LOG.trace('DynamoDB Put: ', params);
    await this.db.putItem(params);
    return this.attributeMapToItem(attributeMap);
  }

  public async putAll(items: T[]): Promise<T[]> {
    const result = await this.batchPutOrDelete(items);
    const rval: T[] = [];
    for (const val of result) {
      rval.push(await this.refreshItem(val));
    }
    return rval;
  }

  public async remove(id: string): Promise<T | undefined> {
    const rval = await this.get(id);
    if (rval) {
      const params = this.toItemInput(id);
      this.LOG.trace('DynamoDB Delete: ', params);
      await this.db.deleteItem(params);
    }
    return rval;
  }

  public async removeAll(ids: string[]): Promise<string[]> {
    const keys = ids.map((id) => CompoundKey.fromItemId(this.itemType, id));
    return (await this.batchPutOrDelete(keys)).map(
      (key) => key.compoundItemId.itemId
    );
  }

  public toItemInput(id: string): GetItemInput {
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

  protected get baseInput() {
    return {
      TableName: this.config.tableName,
    };
  }

  protected attributeMapToItem(map: AttributeMap): T {
    const dynamoItem = new DynamoItem(map);
    const idObj = {
      [this.config.idProperty]: this.toId(dynamoItem),
    };
    return Object.assign(this.config.toItem(map), idObj);
  }

  protected async itemToAttributeMap(item: T): Promise<AttributeMap> {
    const key = CompoundKey.fromItemId(this.itemType, this.toId(item));
    const rval = new DynamoItem(this.config.toAttributeMap(item));
    rval.setString(this.config.partitionKey, key.partitionKey);
    rval.setString(this.config.sortKey, key.sortKey);
    return rval.item;
  }

  protected async getAllMaps(
    partitionValue: string,
    cursor?: string
  ): Promise<AttributeMap[]> {
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
      result = await this.db.query(params);
      if (!result || !result.Items) {
        return [];
      }
    } catch (err) {
      this.LOG.error(
        `Encountered error during query[${JSON.stringify(params)}]: `,
        err
      );
      return [];
    }

    const rval = result.Items;
    if (
      result.LastEvaluatedKey &&
      result.LastEvaluatedKey[this.config.sortKey].S
    ) {
      const moreResults = await this.getAllMaps(
        partitionValue,
        result.LastEvaluatedKey[this.config.sortKey].S
      );
      for (const m of moreResults) {
        rval.push(m);
      }
    }

    return rval;
  }

  private async batchPutOrDelete<V extends T | CompoundKey>(
    requests: V[]
  ): Promise<V[]> {
    const inputs = await this.toBatchWriteInputItems(requests);
    const unprocessed: AttributeMap[] = [];
    for (const input of inputs) {
      unprocessed.push(...(await this.batchWithRetry(input)));
    }
    return this.removeUnprocessed(requests, unprocessed);
  }

  private async removeUnprocessed<V extends T | CompoundKey>(
    requests: V[],
    unprocessed: AttributeMap[]
  ): Promise<V[]> {
    if (unprocessed.length < 1) {
      return requests;
    }
    if ((requests[0] as CompoundKey).partitionKey !== undefined) {
      const failIds = unprocessed.map(
        (key) => CompoundKey.fromAttributeMap(key).compoundItemId.itemId
      );
      return requests.filter(
        (key) => !failIds.includes((key as CompoundKey).compoundItemId.itemId)
      );
    } else {
      const failIds = unprocessed.map(
        (map) => CompoundKey.fromAttributeMap(map).compoundItemId.itemId
      );
      return requests.filter((item) => !failIds.includes(this.toId(item as T)));
    }
  }

  private findWriteRequests(
    input: BatchWriteItemInput,
    tableName: string
  ): WriteRequest[] {
    const rval: WriteRequest[] | undefined =
      input.RequestItems && input.RequestItems[tableName];
    if (!rval) {
      throw new Error(`Write requests missing for table: ${tableName}`);
    }
    return rval;
  }

  private async toBatchWriteInputItems<V extends T | CompoundKey>(
    itemsOrKeys: V[]
  ): Promise<BatchWriteItemInput[]> {
    const tableName = this.config.tableName;
    const writeRequests = await this.toWriteRequests(itemsOrKeys);
    const rval = writeRequests.reduce(
      (inputs: BatchWriteItemInput[], req: WriteRequest, index: number) => {
        if (index % 24 === 0) {
          inputs.push({ RequestItems: { [tableName]: [] } });
        }
        const current: BatchWriteItemInput =
          inputs[inputs.length - 1] && inputs[inputs.length - 1];
        this.findWriteRequests(current, tableName).push(req);
        return inputs;
      },
      []
    );
    return rval;
  }

  private async toWriteRequests<V extends T | CompoundKey>(
    itemsOrKeys: V[]
  ): Promise<WriteRequest[]> {
    const rval: WriteRequest[] = [];
    for (const val of itemsOrKeys) {
      rval.push(await this.toWriteRequest(val));
    }
    return rval;
  }

  private async toWriteRequest<V extends T | CompoundKey>(
    itemOrKey: V
  ): Promise<WriteRequest> {
    return itemOrKey instanceof CompoundKey
      ? { DeleteRequest: { Key: itemOrKey.toKey() } }
      : { PutRequest: { Item: await this.itemToAttributeMap(itemOrKey as T) } };
  }

  private async batchWithRetry(
    input: BatchWriteItemInput,
    maxTries = 10,
    currentTry = 0
  ): Promise<AttributeMap[]> {
    const tableName = this.config.tableName;
    const rval: AttributeMap[] = [];
    if (currentTry === maxTries) {
      const remaining = this.findWriteRequests(input, this.config.tableName);
      if ((remaining[0] as DeleteRequest).Key !== undefined) {
        return remaining.map((req) => req.DeleteRequest?.Key) as AttributeMap[];
      } else {
        return remaining.map((req) => req.PutRequest?.Item) as AttributeMap[];
      }
    }
    const result: BatchWriteItemOutput = await this.db.batchWriteItem(input);
    const unprocessed =
      (result.UnprocessedItems && result.UnprocessedItems[tableName]) || [];
    if (unprocessed.length > 0) {
      currentTry++;
      await AsyncUtils.wait(2 ** currentTry * 10);
      rval.push(
        ...(await this.batchWithRetry(
          {
            RequestItems: { [tableName]: unprocessed },
          },
          maxTries,
          currentTry
        ))
      );
    }
    return rval;
  }
}
