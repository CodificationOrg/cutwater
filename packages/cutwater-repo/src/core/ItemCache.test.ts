import { MemoryCache } from '@codification/cutwater-core';

import { ItemCache } from './ItemCache';
import { MockItem } from './MockItem';

let items: MockItem[];
let cache: ItemCache<MockItem>;
let randomId: string;

beforeEach(() => {
  items = MockItem.createNullables({ max: 25 });
  cache = ItemCache.createNullable(items);
  randomId = `${Math.floor(Math.random() * items.length)}`;
});

describe('ItemCache', () => {
  describe('constructor', () => {
    it('can create a new instance', () => {
      const result = new ItemCache(new MemoryCache(), {
        repoName: 'stuff',
        cacheId: 'PLACEHOLDER',
        itemDescriptor: MockItem.ITEM_DESCRIPTOR,
        ttl: 50,
      });
      expect(result).toBeTruthy();
    });
  });

  describe('invalidate', () => {
    it('can invalidate an id or item', () => {
      expect(cache.includes(randomId)).toBeTruthy();
      cache.invalidate(randomId);
      expect(cache.includes(randomId)).toBeFalsy();
    });
  });

  describe('includes', () => {
    it('can determine if the cache includes an id', () => {
      expect(cache.includes(randomId)).toBeTruthy();
    });
    it('can determine if the cache does not include an id', () => {
      expect(cache.includes(`${items.length + 20}`)).toBeFalsy();
    });
  });

  describe('putAll', () => {
    it('can put all', () => {
      const cache = ItemCache.createNullable();
      const result = cache.putAll(items);
      expect(result.length).toBe(items.length);
      expect(cache.getAll().length).toBe(items.length);
    });
  });

  describe('getAll', () => {
    it('can get all', () => {
      expect(cache.getAll().length).toBe(items.length);
    });
    it('includes added items', () => {
      const newItem = MockItem.createNullable(42);
      cache.put(newItem);
      const allItems = cache.getAll();
      expect(allItems.length).toBe(items.length + 1);
    });
    it('includes updated items', () => {
      const existingItem = cache.get(randomId);
      if (!existingItem) {
        throw new Error(`Id [${randomId}] should exist.`);
      }
      existingItem.age = 422;
      cache.put(existingItem);
      const item = cache.getAll().find((item) => item.userId === randomId);
      expect(item?.age).toBe(422);
    });
    it('returns copies', () => {
      const existingItem = cache
        .getAll()
        .find((item) => item.userId === randomId);
      if (!existingItem) {
        throw new Error(`Id [${randomId}] should exist.`);
      }
      existingItem.age = 422;
      const item = cache.getAll().find((item) => item.userId === randomId);
      expect(item?.age).toBe(+randomId);
    });
    it('excludes removed items', () => {
      cache.remove(randomId);
      expect(cache.getAll().length).toBe(items.length - 1);
    });
  });

  describe('get', () => {
    it('can get an item by id', () => {
      const item = cache.get(randomId);
      expect(item).toBeTruthy();
      expect(item?.userId).toBe(randomId);
    });
    it('returns a copy', () => {
      const existingItem = cache.get(randomId);
      if (!existingItem) {
        throw new Error(`Id [${randomId}] should exist.`);
      }
      existingItem.age = 442;
      expect(cache.get(randomId)?.age).toBe(+randomId);
    });
  });

  describe('put', () => {
    it('can put an item', () => {
      const newId = items.length + 20;
      cache.put(MockItem.createNullable(newId));
      const item = cache.get(`${newId}`);
      expect(item).toBeTruthy();
      expect(item?.userId).toBe(`${newId}`);
    });
    it('returns a copy', () => {
      const item = MockItem.createNullable(items.length + 5);
      const result = cache.put(item);
      expect(item === result).toBeFalsy();
    });
  });

  describe('remove', () => {
    it('can remove an item', () => {
      const removedItem = cache.remove(randomId);
      const allItems = cache.getAll();
      expect(allItems.length).toBe(items.length - 1);
      expect(removedItem?.userId).toBe(randomId);
      expect(cache.get(randomId)).toBeFalsy();
    });
  });
});
