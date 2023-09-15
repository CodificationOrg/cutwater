import { OutputTracker } from '@codification/cutwater-nullable';

import { CachingItemRepository } from './CachingItemRepository';
import { MemoryItemRepository } from './MemoryItemRepository';
import { MockItem } from './MockItem';
import { MethodCallData, TrackedItemRepository } from './TrackedItemRepository';

let count: number;
let items: MockItem[];
let baseRepo: TrackedItemRepository<MockItem>;
let repo: CachingItemRepository<MockItem>;
let randomId: string;
let methodCallTracker: OutputTracker<MethodCallData>;

beforeEach(() => {
  items = MockItem.createNullables(25);
  count = items.length;
  baseRepo = TrackedItemRepository.create(
    MemoryItemRepository.createNullable(items)
  );
  methodCallTracker = baseRepo.trackMethodCalls();
  repo = CachingItemRepository.createNullable(baseRepo);
  randomId = `${Math.floor(Math.random() * items.length)}`;
});

const methodCallCount = (method?: string): number => {
  if (!method) {
    return methodCallTracker.data.length;
  }
  return methodCallTracker.data.filter((data) => data.method === method).length;
};

describe('CachingItemRepository', () => {
  describe('constructor', () => {
    it('can create a new instance', async () => {
      expect(repo).toBeTruthy();
    });
  });

  describe('getAll', () => {
    it('can get all', async () => {
      expect((await repo.getAll()).length).toBe(count);
    });
    it('will use cache after first call', async () => {
      await repo.getAll('a');
      await repo.getAll('a');
      const expected = (await repo.getAll('a')).length > 0 ? 1 : 3;
      expect(methodCallCount()).toBe(expected);
    });
    it('can get all by parentId', async () => {
      const allItems = await repo.getAll('a');
      expect(allItems.length).toBeLessThan(14);
      expect(allItems.length).toBeGreaterThan(9);
    });
    it('will use cache after first call by parentId', async () => {
      await repo.getAll('a');
      expect(methodCallCount()).toBe(1);
      await repo.getAll('a');
      expect(methodCallCount()).toBe(1);
    });
    it('includes added items', async () => {
      const newItem = MockItem.createNullable(count + 1);
      newItem.userId = '42';
      await repo.put(newItem);
      const allItems = await repo.getAll();
      expect(allItems).toHaveLength(count + 1);
    });
    it('includes updated items', async () => {
      const existingItem = await repo.get(randomId);
      expect(existingItem).toBeTruthy();
      if (!existingItem) {
        throw new Error(`Id [${randomId}] should exist.`);
      }
      await repo.getAll(existingItem?.groupId);
      existingItem.age = 442;
      await repo.put(existingItem);
      const updated = await repo.get(randomId);
      expect(updated?.age).toBe(442);
      const allItems = (await repo.getAll(existingItem.groupId)).filter(
        (item) => item.userId === randomId
      );
      expect(allItems).toHaveLength(1);
      expect(allItems[0].age).toBe(442);
    });
    it('returns copies', async () => {
      const existingItem = await repo.get(randomId);
      if (!existingItem) {
        throw new Error(`Id [${randomId}] should exist.`);
      }
      existingItem.age = 442;
      const allItems = (await repo.getAll(existingItem.groupId)).filter(
        (item) => item.userId === randomId
      );
      expect(allItems).toHaveLength(1);
      expect(allItems[0].age).toBe(+randomId);
    });
    it('excludes removed items', async () => {
      await repo.remove(randomId);
      const allItems = await repo.getAll();
      expect(allItems).toHaveLength(count - 1);
    });
  });

  describe('get', () => {
    it('can get an item by id', async () => {
      const item = await repo.get(randomId);
      expect(item).toBeTruthy();
      expect(item?.userId).toBe(randomId);
    });
    it('can get with greedy flag', async () => {
      const repo = CachingItemRepository.createNullable(items, true);
      const item = await repo.get(randomId);
      expect(item?.userId).toBe(randomId);
    });
    it('will do a greedy load triggered by a get', async () => {
      const repo = CachingItemRepository.createNullable(baseRepo, true);

      const promises: Promise<MockItem | undefined>[] = [];
      for (let i = 0; i < 25; i++) {
        promises.push(repo.get(`${i}`));
      }
      await Promise.all(promises);

      const item = await repo.get(randomId);
      expect(item?.userId).toBe(randomId);
      expect(methodCallCount('getAll')).toBe(2);
      expect(methodCallCount('get')).toBe(2);
    });
    it('will use items cached by previous getAll', async () => {
      await repo.getAll('a');
      await repo.get('1');
      expect(methodCallCount('get')).toBe(0);
    });
  });

  describe('put', () => {
    it('can put an item', async () => {
      await repo.put(MockItem.createNullable(count + 1));
      const item = await repo.get(`${count + 1}`);
      expect(item).toBeTruthy();
      expect(item?.userId).toBe(`${count + 1}`);
    });
  });

  describe('invalidate', () => {
    it('can invalidate a cached item', async () => {
      await repo.get(randomId);
      await repo.get(randomId);
      expect(methodCallCount('get')).toBe(1);

      await repo.invalidate(randomId);
      await repo.get(randomId);
      await repo.get(randomId);
      expect(methodCallCount('get')).toBe(2);
    });

    it('can invalidate a cached item with greedy enabled', async () => {
      const repo = CachingItemRepository.createNullable(baseRepo, true);
      await repo.get(randomId);
      await repo.get(randomId);
      expect(methodCallCount('get')).toBe(1);

      await repo.invalidate(randomId);
      await repo.get(randomId);
      await repo.get(randomId);
      expect(methodCallCount('get')).toBe(2);
    });
  });

  describe('remove', () => {
    it('can remove an item', async () => {
      const removedItem = await repo.remove(randomId);
      const allItems = await repo.getAll();
      expect(allItems).toHaveLength(count - 1);
      expect(removedItem?.userId).toBe(randomId);
      expect(await repo.get(randomId)).toBeFalsy();
    });
  });

  describe('removeAll', () => {
    it('can remove multiple items', async () => {
      const ids: string[] = items.map((item) => item.userId).slice(0, 12);
      const removedIds = await repo.removeAll(ids);
      expect(removedIds).toHaveLength(ids.length);
      const allItems = await repo.getAll();
      expect(allItems).toHaveLength(count - ids.length);
      expect(await repo.get(ids[3])).toBeUndefined();
    });
  });
});
