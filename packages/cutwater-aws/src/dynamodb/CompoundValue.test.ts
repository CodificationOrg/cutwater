import { CompoundValue } from './CompoundValue';

describe('CompoundValue', () => {
  describe('create', () => {
    it('can create from a string value', () => {
      const result = CompoundValue.create('this#is#a#test');
      expect(result.parts).toHaveLength(4);
    });
    it('can create from a string array', () => {
      const result = CompoundValue.create('this', 'is', 'a', 'test');
      expect(result.parts).toHaveLength(4);
    });
    it('can create from a mixed array', () => {
      const result = CompoundValue.create('this', 10, undefined, 'test');
      expect(result.parts).toHaveLength(3);
    });
    it('can create from a single item string array', () => {
      const result = CompoundValue.create('this');
      expect(result.parts).toHaveLength(1);
    });
    it('can create from a single item number array', () => {
      const result = CompoundValue.create(6);
      expect(result.parts).toHaveLength(1);
    });
    it('can create from an array only containing undefined values', () => {
      const result = CompoundValue.create(undefined, undefined, undefined);
      expect(result.parts).toHaveLength(0);
    });
  });
});
