import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { AttributeMap } from '../AttributeMap';

export interface CompoundItemRepositoryConfig<T> {
  readonly db?: DynamoDB;
  readonly itemType: string;
  readonly tableName: string;
  readonly idProperty: string;
  readonly partitionKey: string;
  readonly sortKey: string;
  toItem(map: AttributeMap): T;
  toAttributeMap(item: T): AttributeMap;
}
