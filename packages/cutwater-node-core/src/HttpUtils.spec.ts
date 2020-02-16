import { ClientRequest, IncomingMessage } from 'http';
import { request as HttpRequest } from 'https';
import { default as fetch } from 'portable-fetch';
import { HttpUtils } from './HttpUtils';

const GOOGLE_URL: string = 'https://www.google.com';

describe('HttpUtils Unit Tests', () => {
  describe('toBodyText', () => {
    it('correctly returns html content from a node http request', done => {
      const req: ClientRequest = HttpRequest(GOOGLE_URL, (response: IncomingMessage) => {
        expect(HttpUtils.isResponseOk(response)).toBeTruthy();
        HttpUtils.toBodyText(response).then(html => {
          expect(html).toMatch(/<html/);
          done();
        });
      });
      req.end();
    });

    it('correctly returns html content from a got request', async () => {
      const response = await fetch(GOOGLE_URL);
      const html = await HttpUtils.toBodyText(response);
      expect(html).toMatch(/<html/);
    });

    it('correctly returns html content from a got buffer response', async () => {
      const response = await fetch(GOOGLE_URL, { encoding: undefined });
      const html = await HttpUtils.toBodyText(response);
      expect(html).toMatch(/<html/);
    });
  });
});
