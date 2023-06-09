import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'fs';
import { dirname } from 'path/win32';

interface FileSystemProvider {
  exists(path: string): boolean;
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

export class FileSystem {
  private static instance: FileSystem;

  public static create(): FileSystem {
    if (!FileSystem.instance) {
      FileSystem.instance = new FileSystem(new NodeFileSystemProvider());
    }
    return FileSystem.instance;
  }

  public static createNull(entries: NullFileSystemEntry[] = []): FileSystem {
    return new FileSystem(new StubFeatureProvider([...entries]));
  }

  private constructor(private readonly fileSystemProvider: FileSystemProvider) {}

  public exists(path: string): boolean {
    return this.fileSystemProvider.exists(path);
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
    copyFileSync(srcPath, trgPath);
  }
}

class StubFeatureProvider implements FileSystemProvider {
  constructor(private readonly entries: NullFileSystemEntry[] = []) {
    entries.forEach((entry) => {
      const parentDir = dirname(entry.name);
      this.mkdir(parentDir, true);
    });
  }

  private findEntry(path: string): NullFileSystemEntry | undefined {
    return this.entries.find((e) => e.name === path);
  }

  exists(path: string): boolean {
    return this.findEntry(path) !== undefined;
  }

  verifyPath(path: string) {
    if (!this.exists(path)) {
      throw new Error(`Path does not exist: ${path}`);
    }
  }

  getByteCount(path: string): number | undefined {
    this.verifyPath(path);
    const entry = this.findEntry(path);
    return entry ? entry.content?.byteLength || entry.byteCount || 0 : undefined;
  }

  isDirectory(entry?: NullFileSystemEntry): boolean {
    return entry !== undefined && !entry.content;
  }

  delete(path: string, recursive: boolean): void {
    const entry = this.findEntry(path);
    if (this.isDirectory(entry) && !recursive) {
      throw new Error(`Cannot delete directory without recursive flag: ${path}`);
    }
    const children = this.entries.filter((child) => child.name.startsWith(path) && child !== entry);
    if (entry) {
      this.entries.splice(this.entries.indexOf(entry), 1);
    }
    children.forEach((entry) => this.delete(entry.name, true));
  }

  read(path: string): Buffer | undefined {
    const entry = this.findEntry(path);
    if (this.isDirectory(entry)) {
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
    while (parentPath !== path && !this.exists(parentPath)) {
      this.mkdir(parentPath, true);
    }
    if (!this.exists(path)) {
      this.entries.push({
        name: path,
      });
    }
  }

  touch(path: string): void {
    this.verifyParentPath(path);
    const entry = this.findEntry(path);
    if (!entry) {
      this.entries.push({
        name: path,
        byteCount: 0,
      });
    }
  }

  write(path: string, data?: ArrayBuffer | Buffer): void {
    this.verifyParentPath(path);
    this.delete(path, false);
    const entry = {
      name: path,
      content: data,
      byteCount: data?.byteLength || 0,
    };
    this.entries.push(entry);
  }

  copy(srcPath: string, trgPath: string): void {
    const srcEntry = this.findEntry(srcPath);
    if (srcEntry) {
      this.write(trgPath, srcEntry.content);
    }
  }
}
