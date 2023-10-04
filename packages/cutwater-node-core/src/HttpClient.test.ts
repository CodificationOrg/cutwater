import { System } from '@codification/cutwater-nullable';

import { HttpClient } from './HttpClient';

const system = System.createNull();
const notFoundClient = HttpClient.createNull(undefined, system);

const successHtmlClient = HttpClient.createNull(
  {
    statusCode: 200,
    headers: {
      'content-length': '42',
      'content-type': 'text/html',
    },
    raw: Buffer.from('<html><head></head><body>Hi!</body></html>', 'utf-8'),
  },
  system
);

const successObjectClient = HttpClient.createNull(
  {
    statusCode: 200,
    headers: {
      'content-length': '20',
      'content-type': 'application/json',
    },
    raw: Buffer.from(JSON.stringify({ data: 'test data' }), 'utf-8'),
  },
  system
);

describe('HttpClient', () => {
  describe('exists', () => {
    it('returns true for urls returning a success response', async () => {
      const result = await successObjectClient.exists(
        'https://httpbin.org/post'
      );
      expect(result).toBeTruthy();
    });
    it('returns false for urls not returning a response', async () => {
      const result = await notFoundClient.exists('https://httpbin.org/post');
      expect(result).toBeFalsy();
    });
  });

  describe('fetchHtml', () => {
    it('returns html for successful request', async () => {
      const result = await successHtmlClient.fetchHtml(
        'https://httpbin.org/post'
      );
      expect(result).toBeTruthy();
      expect(result?.body).toBe('<html><head></head><body>Hi!</body></html>');
    });
    it('returns undefined if not found', async () => {
      const result = await notFoundClient.fetchHtml('https://httpbin.org/post');
      expect(result).toBeUndefined();
    });
    it('throws error if not html', async () => {
      await expect(() =>
        successObjectClient.fetchHtml('https://httpbin.org/post')
      ).rejects.toThrow('Returned content was not html.');
    });
  });

  describe('fetchObject', () => {
    it('returns object for successful request', async () => {
      const result = await successObjectClient.fetchObject<{ data: string }>(
        'https://httpbin.org/post'
      );
      expect(result).toBeDefined();
      expect(result?.object.data).toBe('test data');
    });
    it('returns undefined if not found', async () => {
      const result = await notFoundClient.fetchObject(
        'https://httpbin.org/post'
      );
      expect(result).toBeUndefined();
    });
    it('throws error if not json', async () => {
      await expect(() =>
        successHtmlClient.fetchObject('https://httpbin.org/post')
      ).rejects.toThrow('Returned content was not valid json.');
    });
  });

  describe('fetchData', () => {
    it('returns buffer for successful request', async () => {
      const result = await successObjectClient.fetchData(
        'https://httpbin.org/post'
      );
      expect(result).toBeDefined();
      expect(result?.data.length).toBe(20);
    });
    it('returns undefined if not found', async () => {
      const result = await notFoundClient.fetchData('https://httpbin.org/post');
      expect(result).toBeUndefined();
    });
  });

  describe('downloadToFile', () => {
    it('downloads and saves data for successful requests', async () => {
      await successObjectClient.downloadToFile(
        'https://httpbin.org/post',
        '/test.download.json'
      );
      expect(system.fileExists('/test.download.json')).toBeTruthy();
      const result = system
        .toFileReference('/test.download.json')
        .readObjectSync<{ data: string }>();
      expect(result?.data).toBe('test data');
    });
    it('throws error if not successful for any reason', async () => {
      await expect(() =>
        notFoundClient.downloadToFile(
          'https://httpbin.org/post',
          '/test.download.json'
        )
      ).rejects.toThrow();
    });
  });

  describe('postForObject', () => {
    it('returns an object for success post', async () => {
      const result = await successObjectClient.postForObject<{ data: string }>(
        'https://httpbin.org/post',
        'test data'
      );
      expect(result).toBeDefined();
      expect(result?.object.data).toBe('test data');
    });
    it('throws error if not json', async () => {
      await expect(() =>
        successHtmlClient.postForObject('https://httpbin.org/post', 'test data')
      ).rejects.toThrow('Returned content was not valid json.');
    });
    it('returns undefined if not found', async () => {
      const result = await notFoundClient.postForObject(
        'https://httpbin.org/post',
        'test data'
      );
      expect(result).toBeUndefined();
    });
  });
});
