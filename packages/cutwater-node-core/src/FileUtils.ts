import { LoggerFactory } from '@codification/cutwater-logging';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import * as os from 'node:os';
import { dirname, join, resolve } from 'path';
import { v4 as uuid } from 'uuid';

const LOG = LoggerFactory.getLogger();

export class FileUtils {
  public static createTempDir(
    prefix: string = join(os.tmpdir(), 'cutwater-'),
    recursive = true
  ): string {
    if (recursive && !this.doesParentDirectoryExist(prefix)) {
      mkdirSync(resolve(dirname(prefix)), { recursive: true });
    }
    const rval = mkdtempSync(prefix);
    LOG.debug(`Created temp directory: ${rval}`);
    return rval;
  }

  public static doesParentDirectoryExist(filePath: string): boolean {
    return existsSync(dirname(resolve(filePath)));
  }

  public static createTempFilePath(tempDir?: string, ext = 'tmp'): string {
    const rval = join(
      tempDir ? tempDir : this.createTempDir(),
      `${uuid()}${ext.startsWith('.') ? ext : '.' + ext}`
    );
    LOG.debug(`Created temp file path: ${rval}`);
    return rval;
  }

  public static deleteDirectory(
    dirPath: string,
    recursive = true,
    maxRetries = 5,
    retryDelay = 100
  ): void {
    rmSync(dirPath, { recursive, retryDelay, maxRetries });
  }
}
