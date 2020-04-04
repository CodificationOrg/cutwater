import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileUtils } from './FileUtils';

describe('FileUtils', () => {
  it('can create a temp directory', () => {
    const tempDir = FileUtils.createTempDir();
    expect(tempDir.startsWith(os.tmpdir() + path.sep + 'cutwater-')).toBeTruthy();
    expect(fs.existsSync(tempDir)).toBeTruthy();
    fs.rmdirSync(tempDir);
  });

  it('can create a temp directory recursively', () => {
    const tempDir = FileUtils.createTempDir('temp/tests/foo-');
    expect(tempDir.indexOf('temp/tests/foo-')).not.toEqual(-1);
    expect(fs.existsSync(tempDir)).toBeTruthy();
    fs.rmdirSync(tempDir);
  });

  it('can create a temp file path', () => {
    const tempPath = FileUtils.createTempFilePath(os.tmpdir());
    expect(tempPath.endsWith('.tmp')).toBeTruthy();
    expect(fs.existsSync(tempPath)).toBeFalsy();
  });

  it('can create unique temp file paths', () => {
    const history: string[] = [];
    for (let i = 0; i < 10; i++) {
      const tempPath = FileUtils.createTempFilePath(os.tmpdir());
      expect(history.indexOf(tempPath)).toEqual(-1);
      history.push(tempPath);
    }
  });

  it('can delete directory recursively', () => {
    FileUtils.createTempDir('temp/tests/sub/foo-');
    FileUtils.deleteDirectory('temp/tests/sub');
    expect(fs.existsSync('temp/tests/sub')).toBeFalsy();
  });

  it('properly fails to delete non-empty directory when not recursive', () => {
    FileUtils.createTempDir('temp/tests/sub/foo-');
    expect(() => {
      FileUtils.deleteDirectory('temp/tests/sub', false);
    }).toThrow();
    FileUtils.deleteDirectory('temp/tests/sub');
  });

  it('can corretly identify a missing parent directory', () => {
    expect(FileUtils.doesParentDirectoryExist('temp/foo/text.txt')).toBeFalsy();
  });

  it('can correctly identify an existing parent directory', () => {
    expect(FileUtils.doesParentDirectoryExist('temp/foo.txt')).toBeTruthy();
  });
});
