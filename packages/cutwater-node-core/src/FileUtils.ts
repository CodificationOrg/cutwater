import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

export class FileUtils {
  public static createTempDir(prefix: string = path.join(process.cwd(), 'temp') + path.sep): string {
    const rval = path.resolve(`${prefix}${(uuid() as string).substr(0, 8)}`);
    fs.mkdirSync(rval, { recursive: true });
    return rval;
  }

  public static createTempFilePath(tempDir?: string, ext: string = 'tmp'): string {
    return path.join(tempDir ? tempDir : this.createTempDir(), `${uuid()}${ext.startsWith('.') ? ext : '.' + ext}`);
  }
}
