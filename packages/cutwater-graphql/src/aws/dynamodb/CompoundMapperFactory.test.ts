import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MockItem } from '../../repositories/ItemCache.test';
import { CompoundMapperConfig } from './CompoundMapperConfig';
import { CompoundMapperFactory } from './CompoundMapperFactory';

export const MOCK_ITEM_MAPPER_CONFIG: CompoundMapperConfig<MockItem> = {
  nodeType: 'MockItem',
  idProperty: 'canonicalId',
  toItem: (map: AttributeMap): MockItem => {
    const dynamoItem = new DynamoItem(map);
    return {
      age: dynamoItem.toNumber('age'),
      name: dynamoItem.toString('name'),
      userId: dynamoItem.toString('userId'),
      groupId: dynamoItem.toString('groupId'),
    } as MockItem;
  },
  toAttributeMap: (item: MockItem): AttributeMap => {
    const dynamoItem = new DynamoItem();
    dynamoItem.setString('name', item.name);
    dynamoItem.setNumber('age', item.age);
    dynamoItem.setString('groupId', item.groupId);
    dynamoItem.setString('userId', item.userId);
    return dynamoItem.item;
  },
};

export const createMapper = () => new CompoundMapperFactory('pk', 'sk').create(MOCK_ITEM_MAPPER_CONFIG);

describe('CompoundMapperFactory', () => {
  describe('create', () => {
    it('can create a new CompoundMapper', () => {
      const result = createMapper();
      expect(result.partitionKey).toBe('pk');
      expect(result.sortKey).toBe('sk');
    });
  });
});
