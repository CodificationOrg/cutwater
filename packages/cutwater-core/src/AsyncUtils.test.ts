import { AsyncUtils } from '.';

describe('AsyncUtils', () => {
  describe('wait', () => {
    it('can wait a specific number of milliseconds', async () => {
      const start = Date.now();
      await AsyncUtils.wait(50);
      const result = Date.now() - start;
      expect(result).toBeGreaterThan(48);
      expect(result).toBeLessThan(52);
    });
  });
});
