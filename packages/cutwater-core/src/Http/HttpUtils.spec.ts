import { request as HttpRequest } from 'follow-redirects/https';
import { IncomingMessage } from 'http';
import * as test from 'tape';

import { HttpUtils } from './HttpUtils';

test('HttpUtils Unit Tests', assert => {
  assert.plan(1);
  const req = HttpRequest('https://www.google.com', (response: IncomingMessage) => {
    if (HttpUtils.isResponseOk(response)) {
      HttpUtils.toBodyText(response).then(html => {
        assert.ok(html.indexOf('<html') > -1, 'correctly returns html page source for Google');
      });
    } else {
      assert.comment('failed to reach Google to perform test');
    }
  });
  req.end();
});
