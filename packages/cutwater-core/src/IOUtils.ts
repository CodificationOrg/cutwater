import { Readable } from 'stream';

export class IOUtils {
  /**
   * Returns a `Readable` stream containing the data from the specified `Buffer`.
   *
   * @param buffer - The `Buffer` containing the data to be streamed.
   */
  public static bufferToReadable(buffer: Buffer): Readable {
    const rval = new Readable();
    rval.push(buffer);
    rval.push(null);
    return rval;
  }
}
