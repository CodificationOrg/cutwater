import * as test from 'tape';

import { Config } from './Config';

// tslint:disable:no-string-literal
test('Config Unit Tests', assert => {
  const expected = process.env['foo'];
  assert.is(Config.get('foo'), expected ? expected : '', 'correctly returns environment or default value');
  Config.put('foo', 'bar');
  assert.is(Config.get('foo'), 'bar', 'correctly returns runtime override value');
  try {
    Config.getRequired('hubbajubbasubba', 'Nope, not there!');
    assert.fail('should have thrown error with supplied message.');
  } catch (error) {
    assert.equal(error.message, 'Nope, not there!', 'throws error for missing value with supplied message.');
  }
  try {
    Config.getRequired('hubbajubbasubba');
    assert.fail('should have thrown error with default message.');
  } catch (error) {
    assert.equal(
      error.message,
      'Required config value [hubbajubbasubba] is missing.',
      'throws error for missing value with default message.',
    );
  }
  assert.end();
});
