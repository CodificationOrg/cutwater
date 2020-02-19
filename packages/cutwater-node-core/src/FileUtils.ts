import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as uuid from 'uuid/v4';

export class FileUtils {
  public static createTempDir(prefix: string = path.join(os.tmpdir(), 'cutwater-')): string {
    return fs.mkdtempSync(prefix);
  }

  public static createTempFilePath(tempDir?: string, ext: string = 'tmp'): string {
    return path.join(tempDir ? tempDir : this.createTempDir(), `${uuid()}${ext.startsWith('.') ? ext : '.' + ext}`);
  }
}
