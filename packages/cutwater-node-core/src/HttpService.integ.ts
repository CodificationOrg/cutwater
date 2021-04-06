import { HttpService } from './HttpService';

const service = new HttpService();

describe('HttpService', () => {
  it('can post', async () => {
    const result = await service.postForObject<{ data: string }>('https://httpbin.org/post', 'test data');
    expect(result).toBeDefined();
    expect(result?.object.data).toBe('"test data"');
  });
});
