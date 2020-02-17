import { Readable } from 'stream';
import { IOUtils } from './IOUtils';

describe('IOUtils', () => {
  it('can convert a Buffer and a Readable', async () => {
    const buffer: Buffer = Buffer.from([0, 1, 2, 3, 4]);
    const result: Readable = IOUtils.bufferToReadable(buffer);

    expect(result).toBeTruthy();
    const data: Buffer = await IOUtils.readableToBuffer(result);
    expect(data.length).toBe(5);
  });
});
