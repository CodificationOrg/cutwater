import { DynamoItem } from '../DynamoItem';
import { CompoundKey } from './CompoundKey';

describe('CompoundKey', () => {
  describe('fromItemId', () => {
    it('can create from an item ID', () => {
      const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');
      expect(result.partitionKey).toBe('foo#bar');
      expect(result.sortKey).toBe('Item#baz');
    });

    it('can create from an item ID without a parent', () => {
      const result = CompoundKey.fromItemId('Item', 'baz');
      expect(result.partitionKey).toBe(CompoundKey.DEFAULT_PARENT);
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

    it('can create from an Attribute Map without a parent', () => {
      const map = new DynamoItem();
      map.setString('pk', CompoundKey.DEFAULT_PARENT);
      map.setString('sk', 'MockItem#42');
      const result = CompoundKey.fromAttributeMap(map.item);
      expect(result.compoundItemId.parentId).toBeUndefined();
      expect(result.compoundItemId.name).toBe('42');
      expect(result.itemType).toBe('MockItem');
      expect(result.compoundItemId.itemId).toBe('42');
    });
  });

  describe('toPartitionKey', () => {
    it('can create from a partition key from a name only itemId', () => {
      const result = CompoundKey.toPartitionKey('nameOnly');
      expect(result).toBe('nameOnly');
    });
    it('can create from a partition key without a parentId', () => {
      const result = CompoundKey.toPartitionKey();
      expect(result).toBe(CompoundKey.DEFAULT_PARENT);
    });
  });

  const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');
  const noParentResult = CompoundKey.fromItemId('Item', 'baz');

  describe('itemId', () => {
    it('provides a valid item ID', () => {
      expect(result.compoundItemId.itemId).toBe('foo:bar:baz');
    });
    it('provides a valid item ID without parent', () => {
      expect(noParentResult.compoundItemId.itemId).toBe('baz');
    });
  });

  describe('parentItemId', () => {
    it('provides a valid parent item ID', () => {
      expect(result.compoundItemId.parentId).toBe('foo:bar');
    });
    it('provides an undefined parentId when none is provided', () => {
      expect(noParentResult.compoundItemId.parentId).toBeUndefined();
    });
  });

  describe('partiionValue', () => {
    it('provides a valid partition value', () => {
      expect(result.partitionKey).toBe('foo#bar');
    });
    it('provides a valid partition value without a parent', () => {
      expect(noParentResult.partitionKey).toBe(CompoundKey.DEFAULT_PARENT);
    });
  });

  describe('sortKeyValue', () => {
    it('provides a valid sortKey value', () => {
      expect(result.sortKey).toBe('Item#baz');
    });
    it('provides a valid sortKey value without a parent', () => {
      expect(noParentResult.sortKey).toBe('Item#baz');
    });
  });
});
