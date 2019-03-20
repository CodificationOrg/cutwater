import { StringUtils } from './StringUtils';

describe('StringUtils Unit Tests', () => {
  test('isBlank', () => {
    expect(StringUtils.isBlank('foo-bar')).toBeFalsy();
    expect(StringUtils.isBlank('     ')).toBeTruthy();
    expect(StringUtils.isBlank('')).toBeTruthy();
  });

  test('isEmpty', () => {
    expect(StringUtils.isEmpty('')).toBeTruthy();
    expect(StringUtils.isEmpty('  ')).toBeFalsy();
    expect(StringUtils.isEmpty('foo-bar')).toBeFalsy();
  });

  test('contains', () => {
    expect(StringUtils.contains('foo-bar', 'foo')).toBeTruthy();
    expect(StringUtils.contains('foo-bar', 'Foo')).toBeFalsy();
    expect(StringUtils.contains('foo-bar', 'Foo', true)).toBeTruthy();
    expect(StringUtils.contains('foo-bar', 'Foo*', true)).toBeFalsy();
  });

  test('startsWith', () => {
    expect(StringUtils.startsWith('foo-bar', 'foo')).toBeTruthy();
    expect(StringUtils.startsWith('foo-bar', 'Foo')).toBeFalsy();
    expect(StringUtils.startsWith('foo-bar', 'Foo', true)).toBeTruthy();
    expect(StringUtils.startsWith('foo-bar', 'Foo*', true)).toBeFalsy();
  });

  test('endsWith', () => {
    expect(StringUtils.endsWith('foo-bar', 'bar')).toBeTruthy();
    expect(StringUtils.endsWith('foo-bar', 'Bar')).toBeFalsy();
    expect(StringUtils.endsWith('foo-bar', 'Bar', true)).toBeTruthy();
    expect(StringUtils.endsWith('foo-bar', '*bar', true)).toBeFalsy();
  });
});