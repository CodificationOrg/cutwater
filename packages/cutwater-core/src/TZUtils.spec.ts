import * as test from 'tape';

import { TZUtils } from './TZUtils';

test('TZUtils Unit Tests', assert => {
  TZUtils.timezoneOffset = undefined;
  assert.is(TZUtils.timezoneOffset, TZUtils.DEFAULT_OFFSET, 'returns the default timezone offset if not set');
  TZUtils.timezoneOffset = 7 * 60 * -1;
  assert.is(TZUtils.timezoneOffset, 7 * 60 * -1, 'changes the timezone offset when set');
  TZUtils.timezoneOffset = TZUtils.DEFAULT_OFFSET;

  assert.ok(TZUtils.timestamp(), 'returns a non empty timestamp');

  assert.end();
});
