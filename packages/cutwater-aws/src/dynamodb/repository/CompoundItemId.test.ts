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

    it('can create a new instance from an item id string with no parent part', () => {
      const result = CompoundItemId.fromItemId('parent');
      expect(result.name).toBe('parent');
    });
  });

  describe('withName', () => {
    it('can create a new instance by adding a name', () => {
      const result = CompoundItemId.fromItemId('parent:23');
      expect(result.withName('42').name).toBe('42');
    });
  });

  const result = CompoundItemId.create('foo:bar:baggins', 'bilbo');
  const noParentResult = CompoundItemId.fromItemId('nameOnly');

  describe('itemId', () => {
    it('can return the correct item id as a string', () => {
      expect(result.itemId).toBe('foo:bar:baggins:bilbo');
    });

    it('can return the correct item id when there is only a name', () => {
      expect(noParentResult.itemId).toBe('nameOnly');
    });
  });

  describe('parentId', () => {
    it('can return the correct parent id as a string', () => {
      expect(result.parentId).toBe('foo:bar:baggins');
    });

    it('can return the undefined parentId when none is present', () => {
      expect(noParentResult.parentId).toBeUndefined();
    });
  });

  describe('idParts', () => {
    it('can return the correct parts of the id as an array', () => {
      expect(result.idParts.length).toBe(4);
      expect(result.idParts[2]).toBe('baggins');
    });
    it('can return the correct parts of the id as an array with name only', () => {
      expect(noParentResult.idParts.length).toBe(1);
      expect(noParentResult.idParts[0]).toBe('nameOnly');
    });
  });

  describe('parentIdParts', () => {
    it('can return the correct parent id parts as an array', () => {
      expect(result.parentIdParts.length).toBe(3);
      expect(result.parentIdParts[1]).toBe('bar');
    });
    it('can return the correct parent id parts as an array when there is no parent', () => {
      expect(noParentResult.parentIdParts.length).toBe(0);
    });
  });
});
