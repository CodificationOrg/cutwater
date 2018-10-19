import * as test from 'tape';

import { StringUtils } from './StringUtils';

test('StringUtils Unit Tests', assert => {
  assert.equal(
    StringUtils.contains('foo-bar', 'foo'),
    true,
    'correctly identifies that a string contains another in a case sensitive manner',
  );
  assert.equal(
    StringUtils.contains('foo-bar', 'Foo'),
    false,
    'correctly identifies that a string does not contain another in a case sensitive manner',
  );
  assert.equal(
    StringUtils.contains('foo-bar', 'Foo', true),
    true,
    'correctly identifies that a string contains another in a case insensitive manner',
  );
  assert.equal(
    StringUtils.contains('foo-bar', 'Foo*', true),
    false,
    'correctly identifies that a string does not contain another in a case insensitive manner',
  );

  assert.equal(
    StringUtils.startsWith('foo-bar', 'foo'),
    true,
    'correctly identifies that a string starts with another in a case sensitive manner',
  );
  assert.equal(
    StringUtils.startsWith('foo-bar', 'Foo'),
    false,
    'correctly identifies that a string does not start with another in a case sensitive manner',
  );
  assert.equal(
    StringUtils.startsWith('foo-bar', 'Foo', true),
    true,
    'correctly identifies that a string starts with another in a case insensitive manner',
  );
  assert.equal(
    StringUtils.startsWith('foo-bar', 'Foo*', true),
    false,
    'correctly identifies that a string does not start with another in a case insensitive manner',
  );

  assert.equal(
    StringUtils.endsWith('foo-bar', 'bar'),
    true,
    'correctly identifies that a string ends with another in a case sensitive manner',
  );
  assert.equal(
    StringUtils.endsWith('foo-bar', 'Bar'),
    false,
    'correctly identifies that a string does not end with another in a case sensitive manner',
  );
  assert.equal(
    StringUtils.endsWith('foo-bar', 'Bar', true),
    true,
    'correctly identifies that a string end with another in a case insensitive manner',
  );
  assert.equal(
    StringUtils.endsWith('foo-bar', '*bar', true),
    false,
    'correctly identifies that a string does not end with another in a case insensitive manner',
  );

  assert.end();
});
