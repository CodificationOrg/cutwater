import { CompoundKey } from './CompoundKey';

describe('CompoundKey', () => {
  describe('fromItemId', () => {
    it('can create from an item ID', () => {
      const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');
      expect(result.partitionKey).toBe('foo#bar');
      expect(result.sortKey).toBe('Item#baz');
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
