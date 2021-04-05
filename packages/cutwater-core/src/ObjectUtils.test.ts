import { ObjectUtils } from './ObjectUtils';

describe('ObjectUtils', () => {
  describe('findProperty', () => {
    it('can find a nested property', () => {
      const value = {
        foo: {
          bar: {
            baz: 5,
          },
        },
      };
      expect(ObjectUtils.findProperty(value, 'foo.bar.baz')).toBe(5);
    });
  });
});
