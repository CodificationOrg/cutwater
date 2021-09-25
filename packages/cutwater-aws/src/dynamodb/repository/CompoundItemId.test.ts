import { CompoundItemId } from './CompoundItemId';

describe('CompoundItemId', () => {
  describe('create', () => {
    it('can create a new instance', () => {
      const result = CompoundItemId.create('parent:23', '42');
      expect(result.itemId).toBe('parent:23:42');
    });
  });

  describe('fromItemId', () => {
    it('can create a new instance from an item id string', () => {
      const result = CompoundItemId.fromItemId('parent:23:42');
      expect(result.name).toBe('42');
    });
  });

  const result = CompoundItemId.create('foo:bar:baggins', 'bilbo');

  describe('itemId', () => {
    it('can return the correct item id as a string', () => {
      expect(result.itemId).toBe('foo:bar:baggins:bilbo');
    });
  });

  describe('idParts', () => {
    it('can return the correct parts of the id as an array', () => {
      expect(result.idParts.length).toBe(4);
      expect(result.idParts[2]).toBe('baggins');
    });
  });

  describe('parentIdParts', () => {
    it('can return the correct parent id parts as an array', () => {
      expect(result.parentIdParts.length).toBe(3);
      expect(result.parentIdParts[1]).toBe('bar');
    });
  });
});
