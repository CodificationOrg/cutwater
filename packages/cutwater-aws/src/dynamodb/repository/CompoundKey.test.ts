import { DynamoItem } from '..';
import { CompoundKey } from './CompoundKey';

describe('CompoundKey', () => {
  describe('fromItemId', () => {
    it('can create from an item ID', () => {
      const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');
      expect(result.partitionKey).toBe('foo#bar');
      expect(result.sortKey).toBe('Item#baz');
    });
  });

  describe('fromAttributeMap', () => {
    it('can create from an Attribute Map', () => {
      const map = new DynamoItem();
      map.setString('pk', 'EC#ABC');
      map.setString('sk', 'MockItem#42');
      const result = CompoundKey.fromAttributeMap(map.item);
      expect(result.compoundItemId.parentId).toBe('EC:ABC');
      expect(result.compoundItemId.name).toBe('42');
      expect(result.itemType).toBe('MockItem');
      expect(result.compoundItemId.itemId).toBe('EC:ABC:42');
    });
  });

  describe('toPartitionKey', () => {
    it('can create from a partition key from a name only itemId', () => {
      const result = CompoundKey.toPartitionKey('nameOnly');
      expect(result).toBe('nameOnly');
    });
  });

  const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');

  describe('itemId', () => {
    it('provides a valid item ID', () => {
      expect(result.compoundItemId.itemId).toBe('foo:bar:baz');
    });
  });

  describe('parentItemId', () => {
    it('provides a valid parent item ID', () => {
      expect(result.compoundItemId.parentId).toBe('foo:bar');
    });
  });

  describe('partiionValue', () => {
    it('provides a valid partition value', () => {
      expect(result.partitionKey).toBe('foo#bar');
    });
  });

  describe('sortKeyValue', () => {
    it('provides a valid sortKey value', () => {
      expect(result.sortKey).toBe('Item#baz');
    });
  });
});
