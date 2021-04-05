import { Comparator } from './Comparator';
import { CompareUtils } from './CompareUtils';

describe('CompareUtils', () => {
  describe('safeCompare', () => {
    it('can sort numbers', () => {
      const values = [3, 9, undefined, 0, 42].sort(CompareUtils.safeCompare);
      expect(values[0]).toBe(0);
      expect(values[4]).toBeUndefined();
    });
    it('can sort strings', () => {
      const values = ['fire', 'apple', 'book', undefined, 'fam'].sort(CompareUtils.safeCompare);
      expect(values[0]).toBe('apple');
      expect(values[4]).toBeUndefined();
    });
  });

  describe('filter', () => {
    const exampleObj = {
      name: 'joe',
      age: 21,
      scores: [34, 54, 97],
      colors: ['blue', 'black', 'red'],
      lock: Date.now(),
    };

    it('can filter based on equal', () => {
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.EQ, 'joe')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.EQ, 'doris')).toBeFalsy();
    });
    it('can filter based on not equal', () => {
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.NE, 'doris')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.NE, 'joe')).toBeFalsy();
    });
    it('can filter based on null', () => {
      expect(CompareUtils.filter(exampleObj, 'frameRate', Comparator.NULL)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.NULL)).toBeFalsy();
    });
    it('can filter based on not null', () => {
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.NOT_NULL)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'frameRate', Comparator.NOT_NULL)).toBeFalsy();
    });
    it('can filter based on greater than', () => {
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.GT, 18)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.GT, 21)).toBeFalsy();
    });
    it('can filter based on greater than or equal', () => {
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.GE, 21)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.GE, 22)).toBeFalsy();
    });
    it('can filter based on less than', () => {
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.LT, 22)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.LT, 18)).toBeFalsy();
    });
    it('can filter based on less than or equal', () => {
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.LE, 21)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.LE, 18)).toBeFalsy();
    });
    it('can filter for value between bounds', () => {
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.BETWEEN, 18, 25)).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'age', Comparator.BETWEEN, 3, 13)).toBeFalsy();
      expect(
        CompareUtils.filter(exampleObj, 'lock', Comparator.BETWEEN, Date.now() - 10000, Date.now() + 5000),
      ).toBeTruthy();
      expect(
        CompareUtils.filter(exampleObj, 'lock', Comparator.BETWEEN, Date.now() + 5000, Date.now() + 15000),
      ).toBeFalsy();
    });
    it('can filter for a contained value', () => {
      expect(CompareUtils.filter(exampleObj, 'colors', Comparator.CONTAINS, 'black')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'colors', Comparator.CONTAINS, 'green')).toBeFalsy();
      expect(CompareUtils.filter(exampleObj, 'scores', Comparator.CONTAINS, '54')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'scores', Comparator.CONTAINS, '12')).toBeFalsy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.CONTAINS, 'o')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.CONTAINS, 'r')).toBeFalsy();
    });
    it('can filter for values not contained', () => {
      expect(CompareUtils.filter(exampleObj, 'colors', Comparator.NOT_CONTAINS, 'purple')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'colors', Comparator.NOT_CONTAINS, 'blue')).toBeFalsy();
      expect(CompareUtils.filter(exampleObj, 'scores', Comparator.NOT_CONTAINS, '12')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'scores', Comparator.NOT_CONTAINS, '54')).toBeFalsy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.NOT_CONTAINS, 'r')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.NOT_CONTAINS, 'e')).toBeFalsy();
    });
    it('can filter for a value from a list', () => {
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.IN, ['jim', 'jay', 'joe'])).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.IN, ['jim', 'jay', 'bob'])).toBeFalsy();
    });
    it('can filter for a value with a prefix', () => {
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.BEGINS_WITH, 'j')).toBeTruthy();
      expect(CompareUtils.filter(exampleObj, 'name', Comparator.BEGINS_WITH, 'z')).toBeFalsy();
    });
  });
});
