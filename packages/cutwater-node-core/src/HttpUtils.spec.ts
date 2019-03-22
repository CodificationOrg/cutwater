import * as got from 'got';
import { ClientRequest, IncomingMessage } from 'http';
import { request as HttpRequest } from 'https';

import { HttpUtils } from './HttpUtils';

const GOOGLE_URL: string = 'https://www.google.com';

describe('HttpUtils Unit Tests', () => {
  test('toBodyText', done => {
    const req: ClientRequest = HttpRequest(GOOGLE_URL, (response: IncomingMessage) => {
      expect(HttpUtils.isResponseOk(response)).toBeTruthy();
      HttpUtils.toBodyText(response).then(html => {
        expect(html).toMatch(/<html/);
        done();
      });
    });
    req.end();
  });

  it('correctly returns html content from a got request', done => {
    got(GOOGLE_URL).then(response => {
      HttpUtils.toBodyText(response).then(html => {
        expect(html).toMatch(/<html/);
        done();
      });
    });
  });

  it('correctly returns html content from a got buffer response', done => {
    got(GOOGLE_URL, { encoding: undefined }).then(response => {
      HttpUtils.toBodyText(response).then(html => {
        expect(html).toMatch(/<html/);
        done();
      });
    });
  });
});
