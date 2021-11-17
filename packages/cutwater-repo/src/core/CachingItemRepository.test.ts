import { ItemRepository } from '../types';
import { CachingItemRepository } from './CachingItemRepository';
import { MockItem, mockItems, randomCount } from './ItemCache.test';
import { ItemPropertyDescriptor } from './ItemPropertyDescriptor';
import { MemoryItemRepository } from './MemoryItemRepository';

const itemDescriptor = new ItemPropertyDescriptor('MockItem', 'userId', 'groupId');

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

const newCachingRepo = async (
  countOrRepo?: number | ItemRepository<MockItem>,
  greedy = false,
): Promise<CachingItemRepository<MockItem>> => {
  const repo =
    !countOrRepo || typeof countOrRepo === 'number'
      ? await newMemoryRepo(countOrRepo)
      : (countOrRepo as ItemRepository<MockItem>);
  const rval = new CachingItemRepository<MockItem>(repo, {
    name: 'MockItems',
    itemDescriptor,
    greedy,
  });
  return rval;
};

describe('CachingItemRepository', () => {
  describe('constructor', () => {
    it('can create a new instance', async () => {
      const result = new CachingItemRepository<MockItem>(await newMemoryRepo(), {
        name: 'MockItems',
        itemDescriptor,
      });
      expect(result).toBeTruthy();
    });
  });

  describe('getAll', () => {
    it('can get all', async () => {
      const count = randomCount();
      const repo = await newCachingRepo(count);
      const items = await repo.getAll();
      expect(items.length).toBe(count);
    });
    it('will use cache after first call', async () => {
      const count = randomCount();
      const baseRepo = await newMemoryRepo(count);
      const spyRepo = jest.spyOn(baseRepo, 'getAll');
      const repo = await newCachingRepo(baseRepo);
      await repo.getAll('a');
      await repo.getAll('a');
      const expected = (await repo.getAll('a')).length > 0 ? 1 : 3;
      expect(spyRepo).toBeCalledTimes(expected);
    });
    it('can get all by parentId', async () => {
      const count = 52;
      const repo = await newCachingRepo(count);
      const items = await repo.getAll('a');
      expect(items.length).toBeLessThan(30);
      expect(items.length).toBeGreaterThan(20);
    });
    it('will use cache after first call by parentId', async () => {
      const count = 52;
      const baseRepo = await newMemoryRepo(count);
      const spyRepo = jest.spyOn(baseRepo, 'getAll');
      const repo = await newCachingRepo(baseRepo);
      await repo.getAll('a');
      expect(spyRepo).toBeCalledTimes(1);
      await repo.getAll('a');
      expect(spyRepo).toBeCalledTimes(1);
    });
    it('includes added items', async () => {
      const count = randomCount();
      const repo = await newCachingRepo(count);
      const newItem = mockItems(1)[0];
      newItem.userId = '42';
      await repo.put(newItem);
      const items = await repo.getAll();
      expect(items.length).toBe(count + 1);
    });
    it('excludes removed items', async () => {
      const count = randomCount();
      const repo = await newCachingRepo(count);
      await repo.remove(`${randomCount(count) - 1}`);
      const items = await repo.getAll();
      expect(items.length).toBe(count - 1);
    });
  });

  describe('get', () => {
    it('can get an item by id', async () => {
      const count = randomCount();
      const repo = await newCachingRepo(count);
      const id = `${randomCount(count) - 1}`;
      const item = await repo.get(id);
      expect(item).toBeTruthy();
      expect(item?.userId).toBe(id);
    });
    it('can do a single load with greedy flag', async () => {
      const repo = await newCachingRepo(25, true);
      const item = await repo.get('5');
      expect(item?.userId).toBe('5');
    });
    it('will do a greedy load triggered by a get', async () => {
      const repo = await newCachingRepo(500, true);
      const getAllSpy = jest.spyOn(repo, 'getAll');
      const promises: Promise<MockItem | undefined>[] = [];
      for (let i = 0; i < 200; i++) {
        promises.push(repo.get(`${randomCount(500) - 1}`));
      }
      await Promise.all(promises);

      const item = await repo.get('5');
      expect(item?.userId).toBe('5');
      expect(getAllSpy).toBeCalledTimes(2);
    });
    it('will use items cached by previous getAll', async () => {
      const repo = await newCachingRepo(100, true);
      const repoSpy = jest.spyOn(repo['repo'], 'get');
      await repo.getAll('a');
      await repo.get('1');
      expect(repoSpy).not.toBeCalled();
    });
  });

  describe('put', () => {
    it('can put an item', async () => {
      const repo = await newCachingRepo();
      await repo.put(mockItems(1)[0]);
      const item = await repo.get('0');
      expect(item).toBeTruthy();
      expect(item?.userId).toBe('0');
    });
  });

  describe('remove', () => {
    it('can remove an item', async () => {
      const count = randomCount();
      const repo = await newCachingRepo(count);
      const id = `${randomCount(count) - 1}`;
      const removedItem = await repo.remove(id);
      const items = await repo.getAll();
      expect(items.length).toBe(count - 1);
      expect(removedItem?.userId).toBe(id);
      expect(await repo.get(id)).toBeFalsy();
    });
  });

  describe('removeAll', () => {
    it('can remove multiple items', async () => {
      const count = randomCount(30, 10);
      const repo = await newCachingRepo(count);

      const ids: string[] = [];
      const toRemove = randomCount(count, 5);
      while (ids.length < toRemove) {
        const id = `${randomCount(count) - 1}`;
        if (!ids.includes(id)) {
          ids.push(id);
        }
      }
      const removedIds = await repo.removeAll(ids);
      expect(removedIds.length).toBe(toRemove);
      const items = await repo.getAll();
      expect(items.length).toBe(count - toRemove);
      expect(await repo.get(ids[randomCount(toRemove, 1)])).toBeUndefined();
    });
  });
});
