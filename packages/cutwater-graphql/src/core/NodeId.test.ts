import { NodeId } from './NodeId';

describe('NodeId', () => {
  describe('create', () => {
    it('can create a unique node id', () => {
      const result = NodeId.create('User', '1');
      expect(result.id.indexOf('User')).toBe(-1);
      expect(result.id).not.toBe(NodeId.create('Collection', '1').id);
    });
    it('can provide a decoded clear id', () => {
      const result = NodeId.from(NodeId.create('User', '42').id);
      expect(result.clearId).toBe('User:42');
    });
  });

  describe('from', () => {
    it('can decode a node type from an id', () => {
      const result = NodeId.from(NodeId.create('User', '1').id);
      expect(result.nodeType).toBe('User');
    });
    it('can decode an object id from an id', () => {
      const result = NodeId.from(NodeId.create('User', '42').id);
      expect(result.objectId).toBe('42');
    });
  });
});
