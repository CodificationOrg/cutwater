import { Config } from './Config';

describe('Config Unit Tests', () => {
  test('get', () => {
    const expected: string = process.env.foo || '';
    expect(Config.get('foo')).toBe(expected);

    Config.put('foo', 'bar');
    expect(Config.get('foo')).toBe('bar');
  });

  test('getRequired', () => {
    Config.put('foo', 'bar');
    expect(Config.getRequired('foo')).toBe('bar');

    try {
      Config.getRequired('hubbajubbasubba', 'Nope, not there!');
      throw new Error('should have thrown error with supplied message.');
    } catch (error) {
      expect(error.message).toBe('Nope, not there!');
    }

    try {
      Config.getRequired('hubbajubbasubba');
      throw new Error('should have thrown error with default message.');
    } catch (error) {
      expect(error.message).toBe('Required config value [hubbajubbasubba] is missing.');
    }
  });
});
