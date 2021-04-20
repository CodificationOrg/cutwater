import { InMemoryLRUCache } from 'apollo-server-caching';
import { ItemCache } from './ItemCache';
import { PropertyDescriptor } from './PropertyDescriptor';

interface MockItem {
  id: string;
  name: string;
  age: number;
}

const mockItems = (count: number) => {
  const rval: MockItem[] = [];
  for (let i = 0; i < count; i++) {
    rval.push({
      id: `${i}`,
      name: `name${i}`,
      age: i,
    });
  }
  return rval;
};

const newInstance = () =>
  new ItemCache<MockItem>(new InMemoryLRUCache(), {
    repoName: 'stuff',
    cacheId: 'PLACEHOLDER',
    itemDescriptor: new PropertyDescriptor('id', 'parent'),
    ttl: 50,
  });

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
      const cache = newInstance();
      await cache.put(mockItems(1)[0]);
      expect(cache.includes('0')).toBeTruthy();
    });
    it('can determine if the cache does not include an id', async () => {
      const cache = newInstance();
      await cache.put(mockItems(1)[0]);
      expect(cache.includes('42')).toBeFalsy();
    });
  });
});
