import { Config } from './Config';

describe('Config', () => {
  it('can get a named config value', () => {
    const expected: string = process.env['foo'] || '';
    expect(Config.get('foo')).toBe(expected);

    Config.put('foo', 'bar');
    expect(Config.get('foo')).toBe('bar');
  });

  describe('getRequired', () => {
    it('can properly return an existing value', () => {
      Config.put('foo', 'bar');
      expect(Config.getRequired('foo')).toBe('bar');
    });

    it('corretly returns the provided error message when value is missing', () => {
      try {
        Config.getRequired('hubbajubbasubba', 'Nope, not there!');
        fail('should have thrown error with supplied message.');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toBe('Nope, not there!');
        } else {
          throw error;
        }
      }
    });

    it('can properly throw an error for a missing value', () => {
      try {
        Config.getRequired('hubbajubbasubba');
        fail('should have thrown error with default message.');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toBe(
            'Required config value [hubbajubbasubba] is missing.'
          );
        } else {
          throw error;
        }
      }
    });
  });
});
