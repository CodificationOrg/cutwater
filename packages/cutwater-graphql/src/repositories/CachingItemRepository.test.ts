import { ItemRepository } from '..';
import { CachingItemRepository } from './CachingItemRepository';
import { MockItem, mockItems, randomCount } from './ItemCache.test';
import { MemoryItemRepository } from './MemoryItemRepository';
import { PropertyDescriptor } from './PropertyDescriptor';

export const newMemoryRepo = async (count?: number): Promise<ItemRepository<MockItem>> => {
  const rval = new MemoryItemRepository<MockItem>(new PropertyDescriptor('userId', 'groupId'));
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
): Promise<CachingItemRepository<MockItem>> => {
  const repo =
    !countOrRepo || typeof countOrRepo === 'number'
      ? await newMemoryRepo(countOrRepo)
      : (countOrRepo as ItemRepository<MockItem>);
  const rval = new CachingItemRepository<MockItem>(repo, {
    name: 'MockItems',
    itemDescriptor: new PropertyDescriptor('userId', 'groupId'),
  });
  return rval;
};

describe('CachingItemRepository', () => {
  describe('constructor', () => {
    it('can create a new instance', async () => {
      const result = new CachingItemRepository<MockItem>(await newMemoryRepo(), {
        name: 'MockItems',
        itemDescriptor: new PropertyDescriptor('userId', 'groupId'),
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
      await repo.getAll();
      expect(spyRepo).toBeCalledTimes(1);
      await repo.getAll();
      expect(spyRepo).toBeCalledTimes(1);
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
});
