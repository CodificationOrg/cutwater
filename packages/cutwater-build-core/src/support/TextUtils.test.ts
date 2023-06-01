import { TextUtils } from './TextUtils';

describe('TextUtils', () => {
  describe('convertCamelCaseToKebab', () => {
    it('can convert camel case to dashes', () => {
      expect(TextUtils.convertCamelCaseToKebabCase('typicalPropName')).toBe('typical-prop-name');
    });
  });

  describe('convertPropertyNameToArg', () => {
    it('can convert camel case config to arg', () => {
      expect(TextUtils.convertPropertyNameToArg('typicalPropName')).toBe('--typical-prop-name');
    });
  });

  describe('combineToMultilineText', () => {
    it('can combine a string array into a single multiline string', () => {
      expect(TextUtils.combineToMultilineText(['one', 'two', 'three'])).toBe('one\ntwo\nthree');
    });
    it('can combine a string array into a single multiline string with trailing LF', () => {
      expect(TextUtils.combineToMultilineText(['one', 'two', 'three'], true)).toBe('one\ntwo\nthree\n');
    });
  });
});
