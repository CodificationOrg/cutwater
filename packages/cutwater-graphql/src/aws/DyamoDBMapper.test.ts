import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MockItem, mockItems } from '../repositories/ItemCache.test';
import { createMapper } from './DyamoDBMapperFactory.test';

export const createAttributeMap = (item: MockItem): AttributeMap => {
  const rval = new DynamoItem();
  rval.setStringParts('pk', 'MockItem', item.userId);
  rval.setStringParts('sk', 'MockItem', item.groupId);
  rval.setString('name', item.name);
  rval.setNumber('age', item.age);
  return rval.item;
};

describe('DynamoDBMapper', () => {
  const mapper = createMapper();

  describe('create', () => {
    it('can create a DynamoDBMap from a MockItem', () => {
      const map = mapper.create(mockItems(1)[0]);
      expect(map).toBeTruthy();
      expect(map.id).toBe('0');
    });

    it('can create a DynamoDBMap from an AttributeMap', () => {
      const map = mapper.create(createAttributeMap(mockItems(1)[0]));
      expect(map).toBeTruthy();
      expect(map.id).toBe('0');
    });

    describe('DynamoDBMap', () => {
      describe('map', () => {
        it('can reaturn a proper AttributeMap', () => {
          const result = new DynamoItem(mapper.create(mockItems(1)[0]).map);
          expect(result.toString('name')).toBe('name0');
          expect(result.toString('pk')).toBe('MockItem#0');
          expect(result.toString('sk')).toBe('MockItem#b');
        });

        it('can reaturn a proper MockItem', () => {
          const result = mapper.create(createAttributeMap(mockItems(1)[0])).item;
          expect(result.name).toBe('name0');
          expect(result.userId).toBe('0');
          expect(result.groupId).toBe('b');
        });
      });
    });
  });

  describe('toPartitionValue', () => {
    it('can generate a partition value', () => {
      const result = mapper.toPartitionValue('0');
      expect(result).toBe('MockItem#0');
    });
  });

  describe('toTypeValue', () => {
    it('can generate a type value', () => {
      const result = mapper.toTypeValue('a');
      expect(result).toBe('MockItem#a');
      expect(mapper.toTypeValue()).toBe('MockItem');
    });
  });
});
