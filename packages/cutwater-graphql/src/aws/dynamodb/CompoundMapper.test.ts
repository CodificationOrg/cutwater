import { DynamoItem } from '@codification/cutwater-aws';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MockItem, mockItems } from '../../repositories/ItemCache.test';
import { createMapper } from './CompoundMapperFactory.test';

export const createAttributeMap = (item: MockItem): AttributeMap => {
  const rval = new DynamoItem();
  rval.setString('pk', item.groupId);
  rval.setString('sk', `MockItem#${item.userId}`);
  rval.setString('name', item.name);
  rval.setNumber('age', item.age);
  rval.setString('userId', item.userId);
  rval.setString('groupId', item.groupId);
  return rval.item;
};

describe('CompoundMapper', () => {
  const mapper = createMapper();

  describe('create', () => {
    it('can create a CompoundMap from a MockItem', () => {
      const map = mapper.create(mockItems(1)[0]);
      expect(map).toBeTruthy();
      expect(map.id).toBe('b:0');
    });

    it('can create a CompoundMap from an AttributeMap', () => {
      const map = mapper.create(createAttributeMap(mockItems(1)[0]));
      expect(map).toBeTruthy();
      expect(map.id).toBe('b:0');
    });

    describe('CompoundMap', () => {
      describe('map', () => {
        it('can reaturn a proper AttributeMap', () => {
          const result = new DynamoItem(mapper.create(mockItems(1)[0]).map);
          expect(result.toString('name')).toBe('name0');
          expect(result.toString('pk')).toBe('b');
          expect(result.toString('sk')).toBe('MockItem#0');
        });

        it('can reaturn a proper MockItem', () => {
          const result = mapper.create(createAttributeMap(mockItems(1)[0])).item;
          expect(result.name).toBe('name0');
          expect(result.userId).toBe('0');
          expect(result.groupId).toBe('b');
          expect(result.canonicalId).toBe('b:0');
        });
      });
    });
  });

  describe('toPartitionValue', () => {
    it('can generate a partition value', () => {
      const result = mapper.toPartitionValue('a:3');
      expect(result).toBe('a');
    });
  });

  describe('toSortKeyValue', () => {
    it('can generate a type value', () => {
      const result = mapper.toSortKeyValue('a:3');
      expect(result).toBe('MockItem#3');
    });
  });
});
