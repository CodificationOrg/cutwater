import { ItemRepository, MemoryItemRepository } from '@codification/cutwater-repo';
import { NodeId } from '../core';
import { ItemRepositoryAdapter } from './ItemRepositoryAdapter';
import { PropertyDescriptor } from './PropertyDescriptor';

const itemDescriptor = new PropertyDescriptor('MockItem', 'userId', 'groupId');

export interface MockItem {
  groupId: string;
  userId: string;
  name: string;
  age: number;
}

export const newMemoryRepo = async (count?: number): Promise<ItemRepository<MockItem>> => {
  const rval = new MemoryItemRepository<MockItem>('MockItem', itemDescriptor);
  if (count) {
    const items = mockItems(count);
    for (const item of items) {
      await rval.put(item);
    }
  }
  return rval;
};

export const randomCount = (max = 25) => Math.max(Math.floor(Math.random() * max), 1);
export const mockItems = (count: number = randomCount()) => {
  const rval: MockItem[] = [];
  for (let i = 0; i < count; i++) {
    const groupId = `${i % 2 ? 'a' : 'b'}`;
    const userId = `${i}`;
    rval.push({
      groupId,
      userId,
      name: `name${i}`,
      age: i,
    });
  }
  return rval;
};

const newAdapter = async (count?: number): Promise<ItemRepositoryAdapter<MockItem>> => {
  return new ItemRepositoryAdapter<MockItem>(await newMemoryRepo(count), itemDescriptor);
};

describe('ItemRepositoryAdapter', () => {
  describe('constructor', () => {
    it('can create a new instance', async () => {
      const result = new ItemRepositoryAdapter<MockItem>(await newMemoryRepo(), itemDescriptor);
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

  describe('dataLoader', () => {
    it('can create a functional DataLoader', async () => {
      const count = randomCount(32);
      const adapter = await newAdapter(count);
      const loader = adapter.dataLoader;
      const items = [
        ...(await adapter.getAll('a')),
        ...(await adapter.getAll('b')),
      ];
      const keyCount = randomCount(items.length) - 1;
      const keys: string[] = [];
      while (keys.length < keyCount) {
        const item = items[randomCount(items.length) - 1];
        if (!keys.includes(item.userId)) {
          keys.push(item.userId);
        }
      }
      expect(keys.length).toBeGreaterThan(0);
      loader.loadMany(keys);
      const key = keys[Math.max(randomCount(keyCount) - 1, 0)];
      const result = await loader.load(key);
      expect(result).toBeTruthy();
      expect(result?.userId).toBe(key);
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

    it('returns undefined for an missing id', async () => {
      const count = randomCount(32);
      const adapter = await newAdapter(count);
      const index = randomCount(count) - 1;
      const id = NodeId.create('MockItem', `${index}abc`);
      const result = await adapter.resolve(id);
      expect(result).toBeUndefined();
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
