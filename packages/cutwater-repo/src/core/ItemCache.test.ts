import { MemoryCache } from '@codification/cutwater-core';
import { ItemCache } from './ItemCache';
import { ItemPropertyDescriptor } from './ItemPropertyDescriptor';

const itemDescriptor = new ItemPropertyDescriptor('MockItem', 'userId', 'groupId');

export interface MockItem {
  groupId: string;
  userId: string;
  name: string;
  age: number;
}

export const randomCount = (max = 25, min = 1) => {
  return Math.max(Math.floor(Math.random() * max + 1), min);
};
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

const newInstance = async (count?: number): Promise<ItemCache<MockItem>> => {
  const rval = new ItemCache<MockItem>(new MemoryCache(), {
    repoName: 'stuff',
    cacheId: 'PLACEHOLDER',
    itemDescriptor,
    ttl: 50,
  });
  if (count) {
    await rval.putAll(mockItems(count));
  }
  return rval;
};

describe('ItemCache', () => {
  describe('constructor', () => {
    it('can create a new instance', () => {
      const result = new ItemCache(new MemoryCache(), {
        repoName: 'stuff',
        cacheId: 'PLACEHOLDER',
        itemDescriptor,
        ttl: 50,
      });
      expect(result).toBeTruthy();
    });
  });

  describe('includes', () => {
    it('can determine if the cache includes an id', async () => {
      const count = randomCount();
      const cache = await newInstance(count);
      expect(cache.includes(`${randomCount(count) - 1}`)).toBeTruthy();
    });
    it('can determine if the cache does not include an id', async () => {
      const cache = await newInstance(randomCount());
      expect(cache.includes('42')).toBeFalsy();
    });
  });

  describe('putAll', () => {
    it('can put all', async () => {
      const count = randomCount();
      const cache = await newInstance();
      await cache.putAll(mockItems(count));
      const items = await cache.getAll();
      expect(items.length).toBe(count);
    });
  });

  describe('getAll', () => {
    it('can get all', async () => {
      const count = randomCount();
      const cache = await newInstance(count);
      const items = await cache.getAll();
      expect(items.length).toBe(count);
    });
    it('includes added items', async () => {
      const count = randomCount();
      const cache = await newInstance(count);
      const newItem = mockItems(1)[0];
      newItem.userId = '42';
      await cache.put(newItem);
      const items = await cache.getAll();
      expect(items.length).toBe(count + 1);
    });
    it('excludes removed items', async () => {
      const count = randomCount();
      const cache = await newInstance(count);
      await cache.remove(`${randomCount(count) - 1}`);
      const items = await cache.getAll();
      expect(items.length).toBe(count - 1);
    });
  });

  describe('get', () => {
    it('can get an item by id', async () => {
      const count = randomCount();
      const cache = await newInstance(count);
      const id = `${randomCount(count) - 1}`;
      const item = await cache.get(id);
      expect(item).toBeTruthy();
      expect(item?.userId).toBe(id);
    });
  });

  describe('put', () => {
    it('can put an item', async () => {
      const cache = await newInstance();
      await cache.put(mockItems(1)[0]);
      const item = await cache.get('0');
      expect(item).toBeTruthy();
      expect(item?.userId).toBe('0');
    });
  });

  describe('remove', () => {
    it('can remove an item', async () => {
      const count = randomCount();
      const cache = await newInstance(count);
      const id = `${randomCount(count) - 1}`;
      const removedItem = await cache.remove(id);
      const items = await cache.getAll();
      expect(items.length).toBe(count - 1);
      expect(removedItem?.userId).toBe(id);
      expect(await cache.get(id)).toBeFalsy();
    });
  });
});
