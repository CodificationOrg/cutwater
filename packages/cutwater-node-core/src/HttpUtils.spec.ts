import * as got from 'got';
import { ClientRequest, IncomingMessage } from 'http';
import { request as HttpRequest } from 'https';

import { HttpUtils } from './HttpUtils';

const GOOGLE_URL: string = 'https://www.google.com';

describe('HttpUtils Unit Tests', () => {

  test('toBodyText', () => {
    expect.assertions(2);
    const req: ClientRequest = HttpRequest(GOOGLE_URL, (response: IncomingMessage) => {
      expect(HttpUtils.isResponseOk(response)).toBeTruthy();
      return expect(HttpUtils.toBodyText(response)).resolves.toMatch('<html');
    });
    req.end();
  });

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