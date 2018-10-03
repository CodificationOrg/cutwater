import * as test from 'tape';

import { contains, endsWith, startsWith } from './StringUtils';

test('StringUtils Unit Tests', assert => {
  assert.equal(
    contains('foo-bar', 'foo'),
    true,
    'correctly identifies that a string contains another in a case sensitive manner',
  );
  assert.equal(
    contains('foo-bar', 'Foo'),
    false,
    'correctly identifies that a string does not contain another in a case sensitive manner',
  );
  assert.equal(
    contains('foo-bar', 'Foo', true),
    true,
    'correctly identifies that a string contains another in a case insensitive manner',
  );
  assert.equal(
    contains('foo-bar', 'Foo*', true),
    false,
    'correctly identifies that a string does not contain another in a case insensitive manner',
  );

  assert.equal(
    startsWith('foo-bar', 'foo'),
    true,
    'correctly identifies that a string starts with another in a case sensitive manner',
  );
  assert.equal(
    startsWith('foo-bar', 'Foo'),
    false,
    'correctly identifies that a string does not start with another in a case sensitive manner',
  );
  assert.equal(
    startsWith('foo-bar', 'Foo', true),
    true,
    'correctly identifies that a string starts with another in a case insensitive manner',
  );
  assert.equal(
    startsWith('foo-bar', 'Foo*', true),
    false,
    'correctly identifies that a string does not start with another in a case insensitive manner',
  );

  assert.equal(
    endsWith('foo-bar', 'bar'),
    true,
    'correctly identifies that a string ends with another in a case sensitive manner',
  );
  assert.equal(
    endsWith('foo-bar', 'Bar'),
    false,
    'correctly identifies that a string does not end with another in a case sensitive manner',
  );
  assert.equal(
    endsWith('foo-bar', 'Bar', true),
    true,
    'correctly identifies that a string end with another in a case insensitive manner',
  );
  assert.equal(
    endsWith('foo-bar', '*bar', true),
    false,
    'correctly identifies that a string does not end with another in a case insensitive manner',
  );

  assert.end();
});
