import * as fs from 'fs';
import * as path from 'path';
import { BuildConfig } from '../BuildConfig';

export class IOUtils {
  public static resolvePath(localPath: string, buildConfig?: BuildConfig): string {
    let rval: string = path.resolve(localPath);
    if (!path.isAbsolute(localPath) && buildConfig) {
      rval = path.resolve(path.join(buildConfig.rootPath, localPath));
    }
    return rval;
  }

  public static fileExists(localPath: string, buildConfig?: BuildConfig): boolean {
    const fullPath: string = this.resolvePath(localPath, buildConfig);
    return fs.existsSync(fullPath);
  }

  public static copyFile(localSourcePath: string, localDestPath?: string, buildConfig?: BuildConfig): void {
    const fullSourcePath: string = path.resolve(__dirname, localSourcePath);
    const destPath = localDestPath || path.basename(localSourcePath);
    const fullDestPath: string = buildConfig ? path.resolve(buildConfig.rootPath, destPath) : destPath;
    fs.copyFileSync(fullSourcePath, fullDestPath);
  }

  public static readJSONSyncSafe<T>(localPath: string, buildConfig?: BuildConfig): T {
    const rval: T | undefined = this.readJSONSync(localPath, buildConfig);
    if (!rval) {
      throw new Error(`Failed to read required JSON file: ${localPath}`);
    }
    return rval;
  }

  public static readJSONSync<T>(localPath: string, buildConfig?: BuildConfig): T | undefined {
    const fullPath: string = this.resolvePath(localPath, buildConfig);
    let rval: T | undefined;
    try {
      const content: string = fs.readFileSync(fullPath, { encoding: 'utf8' });
      rval = JSON.parse(content);
    } catch (e) {
      /* no-op */
    }
    return rval;
  }

  public static afterStreamsFlushed(fastExit: boolean, callback: () => void): void {
    this.afterStreamFlushed('stdout', fastExit, () => {
      this.afterStreamFlushed('stderr', fastExit, () => {
        callback();
      });
    });
  }

  public static afterStreamFlushed(streamName: string, fastExit: boolean, callback: () => void): void {
    if (fastExit) {
      callback();
    } else {
      const stream: NodeJS.WritableStream = process[streamName];
      const outputWritten: boolean = stream.write('');
      if (outputWritten) {
        setTimeout(() => {
          callback();
        }, 250);
      } else {
        stream.once('drain', () => {
          setTimeout(() => {
            callback();
          }, 250);
        });
      }
    }
  }
}
