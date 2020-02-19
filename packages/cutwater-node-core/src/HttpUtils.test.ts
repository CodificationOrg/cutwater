import { default as got } from 'got';
import { IncomingMessage } from 'http';
import { HttpUtils } from './HttpUtils';

const GOOGLE_URL: string = 'https://www.google.com';

describe('HttpUtils', () => {
  describe('toBodyText', () => {
    it('correctly returns html content from a node http request', async () => {
      const response: IncomingMessage = await got(GOOGLE_URL);
      expect(HttpUtils.isResponseOk(response)).toBeTruthy();
      const body: string = await HttpUtils.toBodyText(response);
      expect(body).toMatch(/<html/);
    });

    it('correctly returns html content from a got request', async () => {
      const response = await got(GOOGLE_URL);
      const html = await HttpUtils.toBodyText(response);
      expect(html).toMatch(/<html/);
    });

    it('correctly returns html content from a got buffer response', async () => {
      const response = await got(GOOGLE_URL, { encoding: undefined });
      const html = await HttpUtils.toBodyText(response);
      expect(html).toMatch(/<html/);
    });
  });
});
