import { resolve } from 'path';

import { FileSystem, NullFileSystemEntry, defaultNullFileSystemEntries } from './FileSystem';

export interface FileSystemTestConfig {
  generateRootPath: () => string;
  generateFileSystem: (rootPath: string, entries: NullFileSystemEntry[]) => FileSystem;
}

export const fileSystemTests = (config: FileSystemTestConfig): void => {
  let fs: FileSystem;
  let rootPath: string;

  beforeEach(() => {
    rootPath = config.generateRootPath();
    fs = config.generateFileSystem(rootPath, defaultNullFileSystemEntries);
  });

  const asPath = (partialPath): string => resolve(rootPath, partialPath);

  describe('FileSystem', () => {
    describe('exists', () => {
      it('returns true for an existing file', () => {
        expect(fs.exists(asPath('project/package.json'))).toBeTruthy();
      });
      it('returns true for an existing directory', () => {
        expect(fs.exists(asPath('project'))).toBeTruthy();
      });
      it('returns false for a missing file', () => {
        expect(fs.exists(asPath('project/package.txt'))).toBeFalsy();
      });
      it('returns false for a missing directory', () => {
        expect(fs.exists(asPath('project/abc'))).toBeFalsy();
      });
    });

    describe('isFile', () => {
      it('returns true for a file', () => {
        expect(fs.isFile(asPath('project/package.json'))).toBeTruthy();
      });
      it('returns false for a directory', () => {
        expect(fs.isFile(asPath('project/packages'))).toBeFalsy();
      });
      it('throws an error for missing path', () => {
        expect(() => fs.isFile(asPath('project/foo.json'))).toThrow();
      });
    });

    describe('isDirectory', () => {
      it('returns true for a directory', () => {
        expect(fs.isDirectory(asPath('project'))).toBeTruthy();
      });
      it('returns false for a file', () => {
        expect(fs.isDirectory(asPath('project/package.json'))).toBeFalsy();
      });
      it('throws an error for missing path', () => {
        expect(() => fs.isDirectory(asPath('project/package'))).toThrow();
      });
    });

    describe('listFiles', () => {
      it('returns list of files for a directory', () => {
        expect(fs.listFiles(asPath('project/packages'))).toHaveLength(2);
      });
      it('throws an error for a file', () => {
        expect(() => fs.listFiles(asPath('project/package.json'))).toThrow();
      });
      it('throws an error for missing path', () => {
        expect(() => fs.listFiles(asPath('project/foo'))).toThrow();
      });
    });

    describe('byteCount', () => {
      it('returns correct byte count for an existing file', () => {
        expect(fs.byteCount(asPath('project/test.txt'))).toBe(10);
      });
      it('returns 0 bytes for an existing directory', () => {
        expect(fs.byteCount(asPath('project/packages'))).toBe(0);
      });
      it('throws error for missing file', () => {
        expect(() => fs.byteCount(asPath('project/package.txt'))).toThrow();
      });
    });

    describe('delete', () => {
      it('deletes an existing file', () => {
        fs.delete(asPath('project/packages/package1/package.json'));
        expect(fs.exists(asPath('project/packages/package1/package.json'))).toBeFalsy();
      });
      it('throws error on any directory without recursive flag', () => {
        expect(() => fs.delete(asPath('project/temp'))).toThrow();
      });
      it('throws error deleting a non-empty directory', () => {
        expect(() => fs.delete(asPath('project'))).toThrow();
      });
      it('can recursively deletes directories', () => {
        fs.delete(asPath('project/packages'), true);
        expect(fs.exists(asPath('project/packages/package1'))).toBeFalsy();
        expect(fs.exists(asPath('project/packages/package2'))).toBeFalsy();
        expect(fs.exists(asPath('project/packages/package1/package.json'))).toBeFalsy();
      });
    });

    describe('read', () => {
      it('reads an existing file', () => {
        expect(fs.read(asPath('project/test.txt'))?.toString()).toBe('Test text.');
      });
      it('throws error for any directory', () => {
        expect(() => fs.read(asPath('project'))).toThrow();
      });
      it('throws error for a missing file', () => {
        expect(() => fs.read(asPath('project/test.yaml'))).toThrow();
      });
    });

    describe('write', () => {
      it('writes a new file', () => {
        fs.write(asPath('project/temp/test.txt'), Buffer.from('Empty no more!'));
        expect(fs.read(asPath('project/temp/test.txt'))?.toString()).toBe('Empty no more!');
      });
      it('can overwrite an existing file', () => {
        fs.write(asPath('project/test.txt'), Buffer.from('New content.'));
        expect(fs.read(asPath('project/test.txt'))?.toString()).toBe('New content.');
      });
    });

    describe('mkdir', () => {
      it('can create a new directory', () => {
        fs.mkdir(asPath('project/temp/sub'));
        expect(fs.exists(asPath('project/temp/sub'))).toBeTruthy();
      });
      it('can recursively create directories', () => {
        fs.mkdir(asPath('project/temp/sub/subofsub'), true);
        expect(fs.exists(asPath('project/temp/sub/subofsub'))).toBeTruthy();
      });
      it('throws error if parent directories do not exist', () => {
        expect(() => fs.mkdir(asPath('project/temp/sub/subofsub'))).toThrow();
      });
    });

    describe('touch', () => {
      it('can touch an existing file', () => {
        fs.touch(asPath('project/test.txt'));
        expect(fs.exists(asPath('project/test.txt'))).toBeTruthy();
      });
      it('can touch and create a new file', () => {
        fs.touch(asPath('project/temp/test2.txt'));
        expect(fs.exists(asPath('project/temp/test2.txt'))).toBeTruthy();
      });
      it('throws error if parent directories do not exist', () => {
        expect(() => fs.touch(asPath('project/temp/sub/subofsub/test.txt'))).toThrow();
      });
    });

    describe('copy', () => {
      it('can copy an existing file to a new location', () => {
        fs.copy(asPath('project/test.txt'), asPath('project/temp/copy.txt'));
        expect(fs.read(asPath('project/temp/copy.txt'))?.toString()).toBe('Test text.');
      });
      it('can copy over an existing file', () => {
        fs.copy(asPath('project/test.txt'), asPath('project/package.json'));
        expect(fs.read(asPath('project/package.json'))?.toString()).toBe('Test text.');
      });
      it('throws error if parent directories do not exist', () => {
        expect(() => fs.copy(asPath('bar/test.txt'), asPath('foo/test.txt'))).toThrow();
      });
      it('recursively copies a directory to a new location', () => {
        fs.copy(asPath('project'), asPath('project2'));
        expect(fs.read(asPath('project2/test.txt'))?.toString()).toBe('Test text.');
        expect(fs.exists(asPath('project2/packages'))).toBeTruthy();
        expect(fs.listFiles(asPath('project2/packages'))).toHaveLength(2);
      });
    });
  });
};
