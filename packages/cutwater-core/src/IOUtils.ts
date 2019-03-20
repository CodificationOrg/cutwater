import { Observable, Observer } from 'rxjs';
import { Readable } from 'stream';

export class IOUtils {
  /**
   * Returns a `Readable` stream containing the data from the specified `Buffer`.
   *
   * @param buffer - The `Buffer` containing the data to be streamed.
   */
  public static bufferToReadable(buffer: Buffer): Readable {
    const rval: Readable = new Readable();
    rval.push(buffer);
    rval.push(undefined);
    return rval;
  }

  /**
   * Returns a `Buffer`  containing the data from the specified `Readable`.
   *
   * @param stream - The `Readable` containing the data to be buffered.
   */
  public static readableToBuffer(stream: Readable): Observable<Buffer> {
    // tslint:disable-next-line: no-any
    const rval: any[] = [];
    return Observable.create((observer: Observer<Buffer>) => {
      stream.on('data', data => rval.push(data));
      stream.on('error', err => observer.error(err));
      stream.on('end', () => {
        observer.next(Buffer.concat(rval));
        observer.complete();
      });
    });
  }
}
