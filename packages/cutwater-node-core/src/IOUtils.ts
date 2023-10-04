import { System } from '@codification/cutwater-nullable';
import * as AdmZip from 'adm-zip';
import { resolve } from 'path';
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

  public static zip(
    srcPath: string,
    destPath: string,
    data?: Buffer,
    system: System = System.create()
  ): void {
    const zip = new AdmZip();

    if (!data) {
      const src = system.toFileReference(srcPath);
      if (src.isDirectory()) {
        zip.addLocalFolder(src.path);
      } else {
        zip.addLocalFile(src.path);
      }
    } else {
      zip.addFile(srcPath, data);
    }
    const dest = system.toFileReference(destPath);
    dest.write(zip.toBuffer());
  }

  public static unzip(
    zipPathorBuffer: string | Buffer,
    destPath: string,
    system: System = System.create()
  ): void {
    const src: Buffer =
      typeof zipPathorBuffer === 'string'
        ? system.toFileReference(zipPathorBuffer).readToBuffer()
        : zipPathorBuffer;
    const zip = new AdmZip(src);
    const entries = zip.getEntries();

    entries.forEach((entry) => {
      if (entry.isDirectory) {
        system.mkdir(entry.entryName, true);
      } else {
        const destFile = system.toFileReference(
          resolve(destPath, entry.entryName)
        );
        destFile.write(entry.getData());
      }
    });
  }
}
