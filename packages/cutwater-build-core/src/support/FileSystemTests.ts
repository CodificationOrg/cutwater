import { resolve } from 'path/win32';

import { FileSystem, NullFileSystemEntry } from './FileSystem';

export interface FileSystemTestConfig {
  generateRootPath: () => string;
  generateFileSystem: (rootPath: string, entries: NullFileSystemEntry[]) => FileSystem;
}

export const fileSystemTests = (config: FileSystemTestConfig): void => {
  let fs: FileSystem;
  let rootPath: string;

  const fileSystemEntries: NullFileSystemEntry[] = [
    {
      name: 'test.txt',
      content: Buffer.from('Test text.'),
    },
    {
      name: 'temp',
    },
    {
      name: 'empty',
    },
    {
      name: 'temp/test.txt',
      content: Buffer.from('More test text.'),
    },
    {
      name: 'temp/sub',
    },
    {
      name: 'temp/sub/test.txt',
      content: Buffer.from('Even more test text.'),
    },
  ];

  beforeEach(() => {
    rootPath = config.generateRootPath();
    fs = config.generateFileSystem(rootPath, fileSystemEntries);
  });

  const asPath = (partialPath): string => resolve(rootPath, partialPath);

  describe('FileSystem', () => {
    describe('exists', () => {
      it('returns true for an existing file', () => {
        console.log(asPath('temp/test.txt'));
        expect(fs.exists(asPath('temp/test.txt'))).toBeTruthy();
      });
      it('returns true for an existing directory', () => {
        expect(fs.exists(asPath('temp/sub'))).toBeTruthy();
      });
      it('returns false for a missing file', () => {
        expect(fs.exists(asPath('temp/sub/foo.jpg'))).toBeFalsy();
      });
      it('returns false for a missing directory', () => {
        expect(fs.exists(asPath('temp/subpar'))).toBeFalsy();
      });
    });

    describe('byteCount', () => {
      it('returns correct byte count for an existing file', () => {
        expect(fs.byteCount(asPath('temp/test.txt'))).toBe(15);
      });
      it('returns 0 bytes for an existing directory', () => {
        expect(fs.byteCount(asPath('temp/sub'))).toBe(0);
      });
      it('throws error for missing file', () => {
        expect(() => fs.byteCount(asPath('temp/sub.txt'))).toThrow();
      });
    });

    describe('delete', () => {
      it('deletes an existing file', () => {
        fs.delete(asPath('temp/test.txt'));
        expect(fs.exists(asPath('temp/test.txt'))).toBeFalsy();
      });
      it('throws error on any directory without recursive flag', () => {
        expect(() => fs.delete(asPath('empty'))).toThrow();
      });
      it('throws error deleting a non-empty directory', () => {
        expect(() => fs.delete(asPath('temp'))).toThrow();
      });
      it('can recursively deletes directories', () => {
        fs.delete(asPath('temp'), true);
        expect(fs.exists(asPath('temp'))).toBeFalsy();
        expect(fs.exists(asPath('temp/sub'))).toBeFalsy();
        expect(fs.exists(asPath('temp/text.txt'))).toBeFalsy();
        expect(fs.exists(asPath('temp/sub/text.txt'))).toBeFalsy();
      });
    });

    describe('read', () => {
      it('reads an existing file', () => {
        expect(fs.read(asPath('test.txt'))?.toString()).toBe('Test text.');
      });
      it('throws error for any directory', () => {
        expect(() => fs.read(asPath('empty'))).toThrow();
      });
      it('throws error for a missing file', () => {
        expect(() => fs.read(asPath('empty/test.txt'))).toThrow();
      });
    });

    describe('write', () => {
      it('writes a new file', () => {
        fs.write(asPath('empty/test.txt'), Buffer.from('Empty no more!'));
        expect(fs.read(asPath('empty/test.txt'))?.toString()).toBe('Empty no more!');
      });
      it('can overwrite an existing file', () => {
        fs.write(asPath('test.txt'), Buffer.from('New content.'));
        expect(fs.read(asPath('test.txt'))?.toString()).toBe('New content.');
      });
    });

    describe('mkdir', () => {
      it('can create a new directory', () => {
        fs.mkdir(asPath('empty/sub'));
        expect(fs.exists(asPath('empty/sub'))).toBeTruthy();
      });
      it('can recursively create directories', () => {
        fs.mkdir(asPath('empty/sub/subofsub'), true);
        expect(fs.exists(asPath('empty/sub/subofsub'))).toBeTruthy();
      });
      it('throws error if parent directories do not exist', () => {
        expect(() => fs.mkdir(asPath('empty/sub/subofsub'))).toThrow();
      });
    });

    describe('touch', () => {
      it('can touch an existing file', () => {
        fs.touch(asPath('test.txt'));
        expect(fs.exists(asPath('test.txt'))).toBeTruthy();
      });
      it('can touch and create a new file', () => {
        fs.touch(asPath('empty/test2.txt'));
        expect(fs.exists(asPath('empty/test2.txt'))).toBeTruthy();
      });
      it('throws error if parent directories do not exist', () => {
        expect(() => fs.touch(asPath('empty/sub/subofsub/test.txt'))).toThrow();
      });
    });

    describe('copy', () => {
      it('can copy an existing file to a new location', () => {
        fs.copy(asPath('test.txt'), asPath('temp/copy.txt'));
        expect(fs.read(asPath('temp/copy.txt'))?.toString()).toBe('Test text.');
      });
      it('can copy over an existing file', () => {
        fs.copy(asPath('test.txt'), asPath('temp/test.txt'));
        expect(fs.read(asPath('temp/test.txt'))?.toString()).toBe('Test text.');
      });
      it('throws error if parent directories do not exist', () => {
        expect(() => fs.copy(asPath('test.txt'), asPath('foo/test.txt'))).toThrow();
      });
    });
  });
};
