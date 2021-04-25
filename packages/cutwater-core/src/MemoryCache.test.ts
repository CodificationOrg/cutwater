import { MemoryCache } from './MemoryCache';

const newInstance = (itemCount?: number) => {
  const rval = new MemoryCache();
  if (itemCount) {
    for (let i = 0; i < itemCount; i++) {
      rval.put(`key${i}`, `value${i}`);
    }
  }
  return rval;
};

const delay = (delaySeconds = 1010): Promise<void> => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), delaySeconds);
  });
};

describe('MemoryCache', () => {
  describe('keys', () => {
    it('can return keys', () => {
      const result = newInstance(15).keys();
      expect(result.length).toBe(15);
      expect(result.includes('key6')).toBeTruthy();
    });
  });

  describe('clear', () => {
    it('can clear the cache', () => {
      const cache = newInstance(15);
      cache.clear();
      expect(cache.keys().length).toBe(0);
      expect(cache.containsKey('key6')).toBeFalsy();
    });
  });

  describe('size', () => {
    it('can return the size of the cache', () => {
      const size = newInstance(12).size();
      expect(size).toBe(12);
    });

    it('accurately reflects expired item removal', async () => {
      const cache = newInstance(12);
      cache.put('newItem', 'itemValue', 1);
      expect(cache.size()).toBe(13);
      await delay();
      expect(cache.size()).toBe(12);
    });
  });

  describe('containsKey', () => {
    it('can indicate if a key currently exists', () => {
      const cache = newInstance(25);
      expect(cache.containsKey('key6')).toBeTruthy();
      expect(cache.containsKey('key26')).toBeFalsy();
    });
  });

  describe('put', () => {
    it('can cache a value', () => {
      const cache = newInstance();
      const previous = cache.put('foo', 'bar');
      expect(previous).toBeFalsy();
      expect(cache.containsKey('foo')).toBeTruthy();
      expect(cache.get('foo')).toBe('bar');
    });

    it('can cache a value and return the previous value if it exists', () => {
      const cache = newInstance();
      cache.put('foo', 'oldValue');
      const previous = cache.put('foo', 'bar');
      expect(previous).toBe('oldValue');
      expect(cache.containsKey('foo')).toBeTruthy();
      expect(cache.get('foo')).toBe('bar');
    });
  });

  describe('get', () => {
    it('can return a cached value', () => {
      const cache = newInstance(8);
      expect(cache.get('key3')).toBe('value3');
    });

    it('will not return an expired value', async () => {
      const cache = newInstance();
      cache.put('foo', 'oldValue', 1);
      await delay();
      expect(cache.get('foo')).toBeFalsy();
    });
  });

  describe('remove', () => {
    it('can remove and return a cached value', () => {
      const cache = newInstance(8);
      const result = cache.remove('key2');
      expect(result).toBe('value2');
      expect(cache.size()).toBe(7);
    });
  });
});
