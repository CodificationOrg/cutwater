import { LoggerFactory } from '@codification/cutwater-logging';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as uuid from 'uuid/v4';

const LOG = LoggerFactory.getLogger();

export class FileUtils {
  public static createTempDir(prefix: string = path.join(os.tmpdir(), 'cutwater-'), recursive: boolean = true): string {
    if (recursive && !this.doesParentDirectoryExist(prefix)) {
      fs.mkdirSync(path.resolve(path.dirname(prefix)), { recursive: true });
    }
    const rval = fs.mkdtempSync(prefix);
    LOG.debug(`Created temp directory: ${rval}`);
    return rval;
  }

  public static doesParentDirectoryExist(filePath: string): boolean {
    return fs.existsSync(path.dirname(path.resolve(filePath)));
  }

  public static createTempFilePath(tempDir?: string, ext: string = 'tmp'): string {
    const rval = path.join(
      tempDir ? tempDir : this.createTempDir(),
      `${uuid()}${ext.startsWith('.') ? ext : '.' + ext}`,
    );
    LOG.debug(`Created temp file path: ${rval}`);
    return rval;
  }

  public static deleteDirectory(
    dirPath: string,
    recursive: boolean = true,
    maxRetries: number = 5,
    retryDelay: number = 100,
  ): void {
    fs.rmdirSync(dirPath, { recursive, retryDelay, maxRetries });
  }
}
