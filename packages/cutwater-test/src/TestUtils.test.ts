import * as fs from 'fs';
import * as path from 'path';
import { TestContext } from './TestContext';

describe('TestUtils', () => {
  describe('getTempDir()', () => {
    it('can provide a default temp directory', () => {
      const tempDir = TestContext.createContext().tempDir;
      expect(tempDir.startsWith(path.resolve('temp/test'))).toBeTruthy();
      expect(fs.existsSync(tempDir)).toBeTruthy();
    });

    it('can provide a custom package rooted temp directory', () => {
      const tempDir = TestContext.createContext('temp/foo-').tempDir;
      expect(tempDir.startsWith(path.resolve('temp/foo-'))).toBeTruthy();
      expect(fs.existsSync(tempDir)).toBeTruthy();
    });
  });

  it('can create a temp file path', () => {
    const ctx = TestContext.createContext();
    let tempPath = ctx.createTempFilePath();
    expect(tempPath.endsWith('.tmp')).toBeTruthy();
    expect(fs.existsSync(tempPath)).toBeFalsy();

    tempPath = ctx.createTempFilePath('jpg');
    expect(tempPath.endsWith('.jpg')).toBeTruthy();
  });

  it('can create unique temp file paths', () => {
    const ctx = TestContext.createContext();
    const history: string[] = [];
    for (let i = 0; i < 100; i++) {
      const tempPath = ctx.createTempFilePath();
      expect(history.indexOf(tempPath)).toEqual(-1);
      history.push(tempPath);
    }
  });

  it('can remove the temp directory and all contents', async () => {
    const ctx = TestContext.createContext();
    for (let i = 0; i < 4; i++) {
      const tempFile = ctx.createTempFilePath();
      fs.writeFileSync(tempFile, `just test data ${i}`);
      expect(fs.existsSync(tempFile)).toBeTruthy();
      expect(path.dirname(tempFile)).toEqual(ctx.tempDir);
    }
    await ctx.teardown();
    expect(fs.existsSync(ctx.tempDir)).toBeFalsy();
  });
});
