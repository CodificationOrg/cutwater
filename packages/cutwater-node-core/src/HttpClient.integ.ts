import { HttpClient } from './HttpClient';

const client = HttpClient.create();

describe('HttpClient', () => {
  it('can post', async () => {
    const result = await client.postForObject<{ data: string }>(
      'https://httpbin.org/post',
      'test data'
    );
    expect(result).toBeDefined();
    expect(result?.object.data).toBe('test data');
  });
});
