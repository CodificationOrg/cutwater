import { StringUtils } from './StringUtils';

describe('StringUtils', () => {
  it('can identify a blank string value', () => {
    expect(StringUtils.isBlank('foo-bar')).toBeFalsy();
    expect(StringUtils.isBlank('     ')).toBeTruthy();
    expect(StringUtils.isBlank('')).toBeTruthy();
  });

  it('can identify an empty string value', () => {
    expect(StringUtils.isEmpty('')).toBeTruthy();
    expect(StringUtils.isEmpty('  ')).toBeFalsy();
    expect(StringUtils.isEmpty('foo-bar')).toBeFalsy();
  });

  it('can determine if one string is contained within another', () => {
    expect(StringUtils.contains('foo-bar', 'foo')).toBeTruthy();
    expect(StringUtils.contains('foo-bar', 'Foo')).toBeFalsy();
    expect(StringUtils.contains('foo-bar', 'Foo', true)).toBeTruthy();
    expect(StringUtils.contains('foo-bar', 'Foo*', true)).toBeFalsy();
  });

  it('can identify if a string starts with a value', () => {
    expect(StringUtils.startsWith('foo-bar', 'foo')).toBeTruthy();
    expect(StringUtils.startsWith('foo-bar', 'Foo')).toBeFalsy();
    expect(StringUtils.startsWith('foo-bar', 'Foo', true)).toBeTruthy();
    expect(StringUtils.startsWith('foo-bar', 'Foo*', true)).toBeFalsy();
  });

  it('can identify if a string ends with a value', () => {
    expect(StringUtils.endsWith('foo-bar', 'bar')).toBeTruthy();
    expect(StringUtils.endsWith('foo-bar', 'Bar')).toBeFalsy();
    expect(StringUtils.endsWith('foo-bar', 'Bar', true)).toBeTruthy();
    expect(StringUtils.endsWith('foo-bar', '*bar', true)).toBeFalsy();
  });
});
