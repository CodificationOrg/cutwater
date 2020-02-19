import { FileUtils } from '@codification/cutwater-node-core';
import * as fs from 'fs';
import * as path from 'path';

export class TestContext {
  public static createContext(tempDirName?: string): TestContext {
    return new TestContext(tempDirName);
  }

  public readonly tempDir: string;
  private destroyed: boolean = false;

  private constructor(tempDirName: string = 'temp/test-') {
    const tempPath = path.resolve(path.join(process.cwd(), tempDirName));
    this.tempDir = FileUtils.createTempDir(tempPath);
  }

  public createTempFilePath(ext: string = 'tmp'): string {
    this.checkForDestroyed();
    return FileUtils.createTempFilePath(this.tempDir, ext);
  }

  public teardown(): Promise<void> {
    this.checkForDestroyed();
    this.destroyed = true;
    return new Promise((resolve, reject) => {
      fs.readdir(this.tempDir, (err, files) => {
        if (!err) {
          try {
            files.forEach(file => {
              fs.unlinkSync(path.join(this.tempDir, file));
            });
            fs.rmdirSync(this.tempDir);
            resolve();
          } catch (removalErr) {
            reject(removalErr);
          }
        } else {
          reject(err);
        }
      });
    });
  }

  private checkForDestroyed(): void {
    if (this.destroyed) {
      throw new Error('TestContext has already been torn down.');
    }
  }
}
