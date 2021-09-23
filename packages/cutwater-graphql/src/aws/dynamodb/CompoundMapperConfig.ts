import { AttributeMap } from 'aws-sdk/clients/dynamodb';

export interface CompoundMapperConfig<T> {
  readonly nodeType: string;
  readonly idProperty: string;
  toItem(map: AttributeMap): T;
  toAttributeMap(item: T): AttributeMap;
}
