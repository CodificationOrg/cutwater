import { System } from '@codification/cutwater-nullable';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import * as yauzl from 'yauzl';

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
    rval.push(null);
    return rval;
  }

  /**
   * Returns a `Buffer`  containing the data from the specified `Readable`.
   *
   * @param stream - the `Readable` containing the data to be buffered
   */
  public static readableToBuffer(stream: Readable): Promise<Buffer> {
    const rval: Array<Uint8Array> = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (data) => rval.push(data));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => {
        resolve(Buffer.concat(rval));
      });
    });
  }

  public static async unzip(
    zipFilePath: string,
    destPath: string,
    system: System = System.create()
  ): Promise<void> {
    return new Promise<void>((res, rej) => {
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          rej(err);
        }
        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          const entryPath = join(destPath, entry.fileName);
          if (/\/$/.test(entry.fileName)) {
            system.mkdir(entryPath, true);
            zipfile.readEntry();
          } else {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                rej(err);
              }
              readStream.on('end', () => {
                zipfile.readEntry();
              });
              const writeStream = createWriteStream(entryPath);
              writeStream.on('error', (err) => {
                rej(err);
              });
              readStream.pipe(writeStream);
            });
          }
        });
        zipfile.on('end', res);
      });
    });
  }
}
