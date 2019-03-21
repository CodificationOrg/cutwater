import * as got from 'got';
import { IncomingMessage } from 'http';
import { request as HttpRequest } from 'https';
import * as test from 'tape';

import { HttpUtils } from './HttpUtils';

const GOOGLE_URL = 'https://www.google.com';

test('HttpUtils Unit Tests', assert => {
  assert.plan(3);

  const req = HttpRequest(GOOGLE_URL, (response: IncomingMessage) => {
    if (HttpUtils.isResponseOk(response)) {
      HttpUtils.toBodyText(response).then(html => {
        assert.ok(html.indexOf('<html') > -1, 'correctly returns html page source for Google from node http request');
      });
    } else {
      assert.comment('failed to reach Google to perform test');
    }
  });
  req.end();

  got(GOOGLE_URL)
    .then(response => {
      HttpUtils.toBodyText(response).then(html => {
        assert.ok(html.indexOf('<html') > -1, 'correctly returns html page source for Google from got request');
      });
    })
    .catch(err => assert.error(err));

  got(GOOGLE_URL, { encoding: null })
    .then(response => {
      HttpUtils.toBodyText(response).then(html => {
        assert.ok(html.indexOf('<html') > -1, 'correctly returns html page source for Google from got buffer request');
      });
    })
    .catch(err => assert.error(err));
});
