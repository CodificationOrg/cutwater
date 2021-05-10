import { NodeId } from '../core';
import { newMemoryRepo } from './CachingItemRepository.test';
import { MockItem, mockItems, randomCount } from './ItemCache.test';
import { ItemRepositoryAdapter } from './ItemRepositoryAdapter';
import { PropertyDescriptor } from './PropertyDescriptor';

const newAdapter = async (count?: number): Promise<ItemRepositoryAdapter<MockItem>> => {
  return new ItemRepositoryAdapter<MockItem>(
    'MockItem',
    await newMemoryRepo(count),
    new PropertyDescriptor('userId', 'groupId'),
  );
};

describe('ItemRepositoryAdapter', () => {
  describe('constructor', () => {
    it('can create a new instance', async () => {
      const result = new ItemRepositoryAdapter<MockItem>(
        'MockItem',
        await newMemoryRepo(),
        new PropertyDescriptor('userId', 'groupId'),
      );
      expect(result).toBeTruthy();
    });
  });

  describe('getNodeId', () => {
    it('can generate a node id', async () => {
      const items = mockItems(randomCount());
      const index = randomCount(items.length) - 1;
      const result = (await newAdapter()).getNodeId(items[index]);
      expect(result.nodeType).toBe('MockItem');
      expect(result.objectId).toBe(`${index}`);
      expect(result.id.indexOf('MockItem')).toBe(-1);
    });
  });

  describe('isSource', () => {
    it('can verify if it is a node source by NodeId', async () => {
      const adapter = await newAdapter();
      const id = NodeId.create('MockItem', '0');
      expect(adapter.isSource(id)).toBeTruthy();
    });

    it('can verify if it is a node source by nodeType string', async () => {
      const adapter = await newAdapter();
      const id = NodeId.create('MockItem', '0');
      expect(adapter.isSource(id.nodeType)).toBeTruthy();
    });

    it('can verify if it is not a node source', async () => {
      const adapter = await newAdapter();
      const id = NodeId.create('RealItem', '0');
      expect(adapter.isSource(id)).toBeFalsy();
    });
  });

  describe('resolve', () => {
    it('can resolve a valid node id', async () => {
      const count = randomCount(32);
      const adapter = await newAdapter(count);
      const index = randomCount(count) - 1;
      const id = NodeId.create('MockItem', `${index}`);
      const result = await adapter.resolve(id);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(id.id);
    });
  });

  describe('resolveConnections', () => {
    it('can resolve connections based on parent id', async () => {
      const adapter = await newAdapter(50);
      const result = await adapter.resolveConnections(NodeId.create('MockParent', 'a'));
      expect(result).toBeTruthy();
      expect(result.length).toBe(25);
      expect(result[randomCount(25) - 1].groupId).toBe('a');
    });
  });
});
