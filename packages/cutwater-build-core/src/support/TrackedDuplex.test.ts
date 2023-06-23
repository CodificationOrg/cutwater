import { TrackedDuplex } from './TrackedDuplex';

describe('TrackedDuplex', () => {
  describe('_write', () => {
    it('will emit written data to the OutputTracker', () => {
      const duplex = new TrackedDuplex();
      const tracker = duplex.trackOutput();
      duplex.write('This is some test text.');
      expect(tracker.data).toHaveLength(1);
      expect(tracker.data[0]).toBe('This is some test text.');
    });
  });
  describe('on', () => {
    it('will emit written data to the "data" event', async () => {
      const duplex = new TrackedDuplex();
      const readPromise = new Promise<string>((res) => {
        duplex.on('data', (data) => {
          res(Buffer.from(data).toString());
        });
      });
      duplex.write('This is some test text.');
      const result = await readPromise;
      expect(result).toBe('This is some test text.');
    });
  });
});
