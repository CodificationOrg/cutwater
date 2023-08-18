import {
  closeSync,
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, isAbsolute, resolve } from 'path';

interface FileSystemProvider {
  exists(path: string): boolean;
  isFile(path: string): boolean;
  isDirectory(path: string): boolean;
  listFiles(path: string): string[];
  getByteCount(path: string): number | undefined;
  delete(path: string, recursive: boolean): void;
  touch(path: string): void;
  mkdir(path: string, recursive: boolean): void;
  read(path: string): Buffer | undefined;
  write(path: string, data?: ArrayBuffer | Buffer): void;
  copy(srcPath: string, trgPath: string): void;
}

export interface NullFileSystemEntry {
  name: string;
  content?: ArrayBuffer | Buffer;
  byteCount?: number;
}

export const defaultNullFileSystemEntries: NullFileSystemEntry[] = [
  {
    name: 'project/package.json',
    content: Buffer.from(
      JSON.stringify({
        name: 'rootPackageJson',
        workspaces: {
          packages: ['packages/*'],
        },
      })
    ),
  },
  {
    name: 'project/package.yaml',
    content: Buffer.from(`
    name: rootPackageJson
    workspaces:
      packages:
        - 'packages/*'
    `),
  },
  {
    name: 'project/yarn.lock',
    content: Buffer.from('Not really.'),
  },
  {
    name: 'project/test.txt',
    content: Buffer.from('Test text.'),
  },
  {
    name: 'project/temp',
  },
  {
    name: 'project/packages/package1/package.json',
    content: Buffer.from(
      JSON.stringify({
        name: 'package1',
        main: 'lib/index.js',
      })
    ),
  },
  {
    name: 'project/packages/package1/lib/index.js',
    content: Buffer.from('Index content.'),
  },
  {
    name: 'project/packages/package1/lib/foo.txt',
    content: Buffer.from('Another file.'),
  },
  {
    name: 'project/packages/package2/package.json',
    content: Buffer.from(
      JSON.stringify({
        name: 'package2',
        dependencies: { package1: '^1.x' },
      })
    ),
  },
];

export class FileSystem {
  private static instance: FileSystem;

  public static create(): FileSystem {
    if (!FileSystem.instance) {
      FileSystem.instance = new FileSystem(new NodeFileSystemProvider());
    }
    return FileSystem.instance;
  }

  public static createNull(entries: NullFileSystemEntry[] = defaultNullFileSystemEntries): FileSystem {
    return new FileSystem(new StubFileSystemProvider([...entries]));
  }

  private constructor(private readonly fileSystemProvider: FileSystemProvider) {}

  public exists(path: string): boolean {
    return this.fileSystemProvider.exists(path);
  }

  public isFile(path: string): boolean {
    return this.fileSystemProvider.isFile(path);
  }

  isDirectory(path: string): boolean {
    return this.fileSystemProvider.isDirectory(path);
  }

  listFiles(path: string): string[] {
    return this.fileSystemProvider.listFiles(path);
  }

  public byteCount(path: string): number | undefined {
    return this.fileSystemProvider.getByteCount(path);
  }

  public delete(path: string, recursive = false): void {
    this.fileSystemProvider.delete(path, recursive);
  }

  public read(path: string): Buffer | undefined {
    return this.fileSystemProvider.read(path);
  }

  public write(path: string, data?: ArrayBuffer | Buffer): void {
    this.fileSystemProvider.write(path, data);
  }

  public mkdir(path: string, recursive = false): void {
    this.fileSystemProvider.mkdir(path, recursive);
  }

  public touch(path: string): void {
    this.fileSystemProvider.touch(path);
  }

  public copy(srcPath: string, trgPath: string): void {
    this.fileSystemProvider.copy(srcPath, trgPath);
  }
}

class NodeFileSystemProvider implements FileSystemProvider {
  exists(path: string): boolean {
    return existsSync(path);
  }

  isFile(path: string): boolean {
    return lstatSync(path).isFile();
  }

  isDirectory(path: string): boolean {
    return lstatSync(path).isDirectory();
  }

  listFiles(path: string): string[] {
    return readdirSync(path);
  }

  getByteCount(path: string): number | undefined {
    return statSync(path).size;
  }

  delete(path: string, recursive: boolean): void {
    rmSync(path, { recursive });
  }

  read(path: string): Buffer {
    return readFileSync(path);
  }

  mkdir(path: string, recursive: boolean): void {
    mkdirSync(path, { recursive });
  }

  touch(path: string): void {
    if (this.exists(path)) {
      const now = new Date();
      utimesSync(path, now, now);
    } else {
      closeSync(openSync(path, 'w'));
    }
  }

  write(path: string, data?: ArrayBuffer | Buffer): void {
    if (!data && !this.exists(path)) {
      this.touch(path);
      return;
    } else if (!data) {
      closeSync(openSync(path, 'w'));
      return;
    }
    writeFileSync(path, Buffer.isBuffer(data) ? data : Buffer.from(data));
  }

  copy(srcPath: string, trgPath: string): void {
    if (this.isFile(srcPath)) {
      copyFileSync(srcPath, trgPath);
    } else {
      cpSync(srcPath, trgPath, { recursive: true });
    }
  }
}

class StubFileSystemProvider implements FileSystemProvider {
  constructor(private readonly entries: NullFileSystemEntry[]) {
    entries.forEach((entry) => {
      if (!isAbsolute(entry.name)) {
        entry.name = resolve('/', entry.name);
      }
      const parentDir = dirname(entry.name);
      this.mkdir(parentDir, true);
    });
  }

  private findEntry(path: string): NullFileSystemEntry | undefined {
    return this.entries.find((e) => e.name === resolve(path));
  }

  exists(path: string): boolean {
    return this.findEntry(path) !== undefined;
  }

  verifyPath(path: string) {
    if (!this.exists(path)) {
      throw new Error(`Path does not exist: ${path}`);
    }
  }

  isFile(path: string): boolean {
    return !this.isDirectory(path);
  }

  isDirectory(path: string): boolean {
    this.verifyPath(path);
    return !this.findEntry(path)!.content;
  }

  listFiles(path: string): string[] {
    if (!this.isDirectory(path)) {
      throw new Error(`Path does not refer to a directory: ${path}`);
    }
    return this.entries.filter((entry) => dirname(entry.name) === resolve(path)).map((entry) => basename(entry.name));
  }

  getByteCount(path: string): number | undefined {
    this.verifyPath(path);
    const entry = this.findEntry(path);
    return entry ? entry.content?.byteLength || entry.byteCount || 0 : undefined;
  }

  delete(path: string, recursive: boolean): void {
    const entry = this.findEntry(path);
    if (this.exists(path) && this.isDirectory(path) && !recursive) {
      throw new Error(`Cannot delete directory without recursive flag: ${path}`);
    }
    const children = this.entries.filter((child) => child.name.startsWith(resolve(path)) && child !== entry);
    if (entry) {
      this.entries.splice(this.entries.indexOf(entry), 1);
    }
    children.forEach((entry) => this.delete(entry.name, true));
  }

  read(path: string): Buffer | undefined {
    const entry = this.findEntry(path);
    if (this.isDirectory(path)) {
      throw new Error(`Cannot read from a directory: ${path}`);
    }
    return Buffer.from(entry!.content!);
  }

  verifyParentPath(path: string) {
    const parentPath = dirname(path);
    if (!this.exists(parentPath)) {
      throw new Error(`Parent directory does not exist: ${parentPath}`);
    }
  }

  mkdir(path: string, recursive: boolean): void {
    if (!recursive) {
      this.verifyParentPath(path);
    }
    const parentPath = dirname(path);
    while (parentPath !== resolve(path) && !this.exists(parentPath)) {
      this.mkdir(parentPath, true);
    }
    if (!this.exists(path)) {
      this.entries.push({
        name: resolve(path),
      });
    }
  }

  touch(path: string): void {
    this.verifyParentPath(path);
    const entry = this.findEntry(path);
    if (!entry) {
      this.entries.push({
        name: resolve(path),
        byteCount: 0,
      });
    }
  }

  write(path: string, data?: ArrayBuffer | Buffer): void {
    this.verifyParentPath(path);
    if (this.exists(path)) {
      this.delete(path, false);
    }
    const entry = {
      name: resolve(path),
      content: data,
      byteCount: data?.byteLength || 0,
    };
    this.entries.push(entry);
  }

  copy(srcPath: string, trgPath: string): void {
    this.verifyPath(srcPath);
    if (this.exists(trgPath)) {
      this.delete(trgPath, true);
    }
    if (this.isFile(srcPath)) {
      this.verifyParentPath(trgPath);
      const srcEntry = this.findEntry(srcPath);
      if (srcEntry) {
        this.write(resolve(trgPath), srcEntry.content);
      }
    } else {
      this.mkdir(trgPath, true);
      this.listFiles(srcPath).forEach((file) => {
        const srcChild = resolve(srcPath, file);
        const dstChild = resolve(trgPath, file);
        this.copy(srcChild, dstChild);
      });
    }
  }
}
