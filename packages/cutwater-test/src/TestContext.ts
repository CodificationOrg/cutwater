import { FileUtils } from '@codification/cutwater-node-core';
import { copyFileSync } from 'fs';
import { extname, join, resolve } from 'path/win32';

export class TestContext {
  public static createContext(tempDirPrefix?: string): TestContext {
    return new TestContext(tempDirPrefix);
  }

  public readonly tempDir: string;
  private destroyed = false;

  private constructor(tempDirPrefix = 'temp/test-') {
    const tempPath = resolve(join(process.cwd(), tempDirPrefix));
    this.tempDir = FileUtils.createTempDir(tempPath);
  }

  public createTempFilePath(ext = 'tmp'): string {
    this.checkForDestroyed();
    return FileUtils.createTempFilePath(this.tempDir, ext);
  }

  public copyToTempFile(srcPath: string): string {
    this.checkForDestroyed();
    const ext = extname(srcPath).substring(1);
    const rval = this.createTempFilePath(ext);
    copyFileSync(srcPath, rval);
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
