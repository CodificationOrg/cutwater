import { timer } from 'rxjs';
import * as test from 'tape';

import { ObserverUtils } from './ObserverUtils';

test('ObserverUtils Unit Tests', t => {
  t.plan(3);

  let src = timer(1000);
  let timeoutOb = ObserverUtils.timeout(src, '1000ms interval', 1500, true);
  timeoutOb.subscribe(result => t.is(result, 0, 'correctly returns before timeout'));

  src = timer(1500);
  timeoutOb = ObserverUtils.timeout(src, '1500ms interval', 1000, true);
  timeoutOb.subscribe(result => t.is(result, null, 'correctly returns null after timeout'));

  src = timer(1500);
  timeoutOb = ObserverUtils.timeout(src, '1500ms interval', 1000, false);
  timeoutOb.subscribe(
    result => t.fail('should have thrown error after timeout'),
    err => t.pass('correctly throws error after timeout'),
  );
});
