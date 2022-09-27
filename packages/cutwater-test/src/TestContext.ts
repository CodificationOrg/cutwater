import { FileUtils } from '@codification/cutwater-node-core';
import * as fs from 'fs';
import * as path from 'path';

export class TestContext {
  public static createContext(tempDirPrefix?: string): TestContext {
    return new TestContext(tempDirPrefix);
  }

  public readonly tempDir: string;
  private destroyed = false;

  private constructor(tempDirPrefix = 'temp/test-') {
    const tempPath = path.resolve(path.join(process.cwd(), tempDirPrefix));
    this.tempDir = FileUtils.createTempDir(tempPath);
  }

  public createTempFilePath(ext = 'tmp'): string {
    this.checkForDestroyed();
    return FileUtils.createTempFilePath(this.tempDir, ext);
  }

  public copyToTempFile(srcPath: string): string {
    this.checkForDestroyed();
    const ext = path.extname(srcPath).substring(1);
    const rval = this.createTempFilePath(ext);
    fs.copyFileSync(srcPath, rval);
    return rval;
  }

  public teardown(): void {
    this.checkForDestroyed();
    this.destroyed = true;
    FileUtils.deleteDirectory(this.tempDir);
  }

  private checkForDestroyed(): void {
    if (this.destroyed) {
      throw new Error('TestContext has already been torn down.');
    }
  }
}
