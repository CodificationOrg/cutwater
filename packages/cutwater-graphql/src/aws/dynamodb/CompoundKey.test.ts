import { NodeId } from '../..';
import { CompoundKey } from './CompoundKey';

describe('CompoundKey', () => {
  describe('fromNodeId', () => {
    it('can create from a NodeId', () => {
      const result = CompoundKey.fromNodeId(NodeId.create('Item', 'foo:bar:baz'));
      expect(result.partitionValue).toBe('foo#bar');
      expect(result.sortKeyValue).toBe('Item#baz');
    });
  });

  describe('fromItemId', () => {
    it('can create from an item ID', () => {
      const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');
      expect(result.partitionValue).toBe('foo#bar');
      expect(result.sortKeyValue).toBe('Item#baz');
    });
  });

  describe('fromKey', () => {
    it('can create from a compound key', () => {
      const result = CompoundKey.fromKey('foo#bar', 'Item#baz');
      expect(result.itemId).toBe('foo:bar:baz');
      expect(result.parentItemId).toBe('foo:bar');
    });
  });

  const result = CompoundKey.fromItemId('Item', 'foo:bar:baz');
  describe('nodeId', () => {
    it('provides a valid nodeId', () => {
      expect(result.nodeId.nodeType).toBe('Item');
      expect(result.nodeId.objectId).toBe('foo:bar:baz');
    });
  });

  describe('itemId', () => {
    it('provides a valid item ID', () => {
      expect(result.itemId).toBe('foo:bar:baz');
    });
  });

  describe('parentItemId', () => {
    it('provides a valid parent item ID', () => {
      expect(result.parentItemId).toBe('foo:bar');
    });
  });

  describe('partiionValue', () => {
    it('provides a valid partition value', () => {
      expect(result.partitionValue).toBe('foo#bar');
    });
  });

  describe('sortKeyValue', () => {
    it('provides a valid sortKey value', () => {
      expect(result.sortKeyValue).toBe('Item#baz');
    });
  });
});
