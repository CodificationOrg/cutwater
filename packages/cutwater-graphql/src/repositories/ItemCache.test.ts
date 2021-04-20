import { InMemoryLRUCache } from 'apollo-server-caching';
import { ItemCache } from './ItemCache';
import { PropertyDescriptor } from './PropertyDescriptor';

export interface MockItem {
  userId: string;
  name: string;
  age: number;
}

export const mockItems = (count: number) => {
  const rval: MockItem[] = [];
  for (let i = 0; i < count; i++) {
    rval.push({
      userId: `${i}`,
      name: `name${i}`,
      age: i,
    });
  }
  return rval;
};

const newInstance = async (count?: number): Promise<ItemCache<MockItem>> => {
  const rval = new ItemCache<MockItem>(new InMemoryLRUCache(), {
    repoName: 'stuff',
    cacheId: 'PLACEHOLDER',
    itemDescriptor: new PropertyDescriptor('userId', 'parent'),
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
      const result = new ItemCache(new InMemoryLRUCache(), {
        repoName: 'stuff',
        cacheId: 'PLACEHOLDER',
        itemDescriptor: new PropertyDescriptor('id', 'parent'),
        ttl: 50,
      });
      expect(result).toBeTruthy();
    });
  });

  describe('includes', () => {
    it('can determine if the cache includes an id', async () => {
      const cache = await newInstance(1);
      expect(cache.includes('0')).toBeTruthy();
    });
    it('can determine if the cache does not include an id', async () => {
      const cache = await newInstance(3);
      expect(cache.includes('42')).toBeFalsy();
    });
  });

  describe('getAll', () => {
    it('can get all', async () => {
      const cache = await newInstance(15);
      const items = await cache.getAll();
      expect(items.length).toBe(15);
    });
    it('includes items added later', async () => {
      const cache = await newInstance(15);
      const newItem = mockItems(1)[0];
      newItem.userId = '42';
      await cache.put(newItem);
      const items = await cache.getAll();
      expect(items.length).toBe(16);
    });
    it('excludes removed items', async () => {
      const cache = await newInstance(15);
      await cache.remove('10');
      const items = await cache.getAll();
      expect(items.length).toBe(14);
    });
  });
});
