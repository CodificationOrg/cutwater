import { LoggerFactory } from '@codification/cutwater-logging';
import fs from 'fs';
import os from 'os';
import path from 'path';
import uuid from 'uuid/v4';

const LOG = LoggerFactory.getLogger();

export class FileUtils {
  public static createTempDir(prefix: string = path.join(os.tmpdir(), 'cutwater-'), recursive = true): string {
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

  public static createTempFilePath(tempDir?: string, ext = 'tmp'): string {
    const rval = path.join(
      tempDir ? tempDir : this.createTempDir(),
      `${uuid()}${ext.startsWith('.') ? ext : '.' + ext}`,
    );
    LOG.debug(`Created temp file path: ${rval}`);
    return rval;
  }

  public static deleteDirectory(dirPath: string, recursive = true, maxRetries = 5, retryDelay = 100): void {
    fs.rmdirSync(dirPath, { recursive, retryDelay, maxRetries });
  }
}
