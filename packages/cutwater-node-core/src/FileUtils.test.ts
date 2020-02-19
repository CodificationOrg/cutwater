import * as fs from 'fs';
import * as path from 'path';
import { FileUtils } from './FileUtils';

describe('FileUtils', () => {
  it('can create a temp directory', () => {
    const tempDir = FileUtils.createTempDir();
    expect(tempDir.startsWith(path.join(process.cwd(), 'temp'))).toBeTruthy();
    expect(fs.existsSync(tempDir)).toBeTruthy();
    fs.rmdirSync(tempDir);
  });

  it('can create a temp file path', () => {
    const tempPath = FileUtils.createTempFilePath(process.cwd());
    expect(tempPath.endsWith('.tmp')).toBeTruthy();
    expect(fs.existsSync(tempPath)).toBeFalsy();
  });

  it('can create unique temp file paths', () => {
    const history: string[] = [];
    for (let i = 0; i < 100; i++) {
      const tempPath = FileUtils.createTempFilePath(process.cwd());
      expect(history.indexOf(tempPath)).toEqual(-1);
      history.push(tempPath);
    }
  });
});
