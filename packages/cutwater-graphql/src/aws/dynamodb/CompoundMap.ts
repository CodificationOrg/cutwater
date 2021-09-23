import { AttributeMap } from 'aws-sdk/clients/dynamodb';

export interface CompoundMap<T> {
  id: string;
  partitionValue: string;
  sortKeyValue: string;
  item: T;
  map: AttributeMap;
}
