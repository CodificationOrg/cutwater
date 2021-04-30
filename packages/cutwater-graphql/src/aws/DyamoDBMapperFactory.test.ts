import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MockItem } from '../repositories/ItemCache.test';
import { DynamoDBMapperConfig, DynamoDBMapperFactory } from './DynamoDBMapperFactory';

export const MOCK_ITEM_MAPPER_CONFIG: DynamoDBMapperConfig<MockItem> = {
  nodeType: 'MockItem',
  idProperty: 'userId',
  parentIdProperty: 'groupId',
  toItem: (map: AttributeMap): MockItem => {
    const dynamoItem = new DynamoItem(map);
    return {
      age: dynamoItem.toNumber('age'),
      name: dynamoItem.toString('name'),
    } as MockItem;
  },
  toAttributeMap: (item: MockItem): AttributeMap => {
    const dynamoItem = new DynamoItem();
    dynamoItem.setString('name', item.name);
    dynamoItem.setNumber('age', item.age);
    return dynamoItem.item;
  },
};

export const createMapper = () => new DynamoDBMapperFactory('pk', 'sk').create(MOCK_ITEM_MAPPER_CONFIG);

describe('DynamoDBMapperFactory', () => {
  describe('create', () => {
    it('can create a new DynamoDBMapper', () => {
      const result = createMapper();
      expect(result.idKey).toBe('pk');
      expect(result.typeKey).toBe('sk');
    });
  });
});
