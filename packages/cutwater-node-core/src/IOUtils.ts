import { Readable } from 'stream';

/**
 * Utility for handling common IO related tasks.
 * @beta
 */
export class IOUtils {
  /**
   * Returns a `Readable` stream containing the data from the specified `Buffer`.
   *
   * @param buffer - the `Buffer` containing the data to be streamed
   */
  public static bufferToReadable(buffer: Buffer): Readable {
    const rval: Readable = new Readable();
    rval.push(buffer);
    // tslint:disable-next-line: no-null-keyword
    rval.push(null);
    return rval;
  }

  /**
   * Returns a `Buffer`  containing the data from the specified `Readable`.
   *
   * @param stream - the `Readable` containing the data to be buffered
   */
  public static readableToBuffer(stream: Readable): Promise<Buffer> {
    // tslint:disable-next-line: no-any
    const rval: any[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', data => rval.push(data));
      stream.on('error', err => reject(err));
      stream.on('end', () => {
        resolve(Buffer.concat(rval));
      });
    });
  }
}
