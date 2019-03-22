import { Readable } from 'stream';

import { IOUtils } from './IOUtils';

describe('IOUtils Unit Tests', () => {
  test('bufferToReadable', done => {
    const buffer: Buffer = Buffer.from([0, 1, 2, 3, 4]);
    const result: Readable = IOUtils.bufferToReadable(buffer);

    expect(result).toBeTruthy();
    IOUtils.readableToBuffer(result).then(data => {
      expect(data.length).toBe(5);
      done();
    });
  });
});
