import { EventEmitter } from 'events';
import yaml, { SchemaDefinition } from 'js-yaml';
import { basename, isAbsolute, join, resolve } from 'path/win32';
import { ReadStream, WriteStream } from 'tty';
import yargs from 'yargs';

import { FileReference } from '../types/FileReference';
import { FileSystem } from './FileSystem';
import { LimitedProcess, Process } from './Process';

export class System extends EventEmitter {
  public static create(): System {
    return new System(Process.create(), FileSystem.create(), yargs.argv as Record<string, string | boolean>);
  }

  public static createNull(
    args: Record<string, string | boolean> = {},
    process: Process = Process.createNull(),
    fileSystem: FileSystem = FileSystem.createNull(),
  ): System {
    return new System(process, fileSystem, args);
  }

  protected constructor(
    private readonly process: LimitedProcess,
    private readonly fileSystem: FileSystem,
    public readonly args: Record<string, string | boolean>,
  ) {
    super();
  }

  public cwd(): string {
    return this.process.cwd();
  }

  public get version(): string {
    return this.process.version;
  }

  public get env(): Record<string, string | undefined> {
    return this.process.env;
  }

  public get stdin(): ReadStream & { fd: 0 } {
    return this.process.stdin;
  }

  public get stdout(): WriteStream & { fd: 1 } {
    return this.process.stdout;
  }

  public get stderr(): WriteStream & { fd: 2 } {
    return this.process.stderr;
  }

  public exit(code?: number | undefined): never {
    return this.process.exit(code);
  }

  public on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.process.on(eventName, (...args: any[]): void => {
      listener(args);
    });
    return this;
  }

  protected resolvePath(path: string): string {
    let rval: string = resolve(path);
    if (!isAbsolute(path)) {
      rval = resolve(join(this.cwd(), path));
    }
    return rval;
  }

  public mkdir(path: string, recursive = false): FileReference {
    const dirsPath = this.resolvePath(path);
    if (!this.fileSystem.exists(dirsPath)) {
      this.fileSystem.mkdir(dirsPath, recursive);
    }
    return this.toFileReference(dirsPath);
  }

  public fileExists(path: string): boolean {
    return this.fileSystem.exists(this.resolvePath(path));
  }

  public toFileReference(path: string): FileReference {
    return new FileReferenceImpl(this.resolvePath(path), this.fileSystem);
  }
}

class FileReferenceImpl implements FileReference {
  private static readonly JSON: string = 'json';
  private static readonly YAML: string[] = ['yaml', 'yml'];
  private static readonly DEFAULT_STRING_ENCODING = 'utf-8';

  constructor(public readonly path: string, private readonly fileSystem: FileSystem) {}

  private isJSON(): boolean {
    return basename(this.path).toLowerCase().endsWith(FileReferenceImpl.JSON);
  }

  private isYaml(): boolean {
    return FileReferenceImpl.YAML.find((ext) => basename(this.path).toLowerCase().endsWith(ext)) !== undefined;
  }

  public exists(): boolean {
    return this.fileSystem.exists(this.path);
  }

  public isFile(): boolean {
    return this.fileSystem.isFile(this.path);
  }

  public isDirectory(): boolean {
    return this.fileSystem.isDirectory(this.path);
  }

  public children(): FileReference[] {
    if (!this.isDirectory()) {
      return [];
    }
    return this.fileSystem
      .listFiles(this.path)
      .map((file) => new FileReferenceImpl(resolve(this.path, file), this.fileSystem));
  }

  public delete(recursive = false): FileReference {
    this.fileSystem.delete(this.path, recursive);
    return this;
  }

  public copyTo(destination: FileReference): FileReference {
    this.fileSystem.copy(this.path, destination.path);
    return destination;
  }

  public readObjectSyncSafe<T>(schema?: SchemaDefinition): T {
    const rval: T | undefined = this.readObjectSync<T>(schema);
    if (!rval) {
      throw new Error(`Failed to read required object file: ${this.path}`);
    }
    return rval;
  }

  public readObjectSync<T>(schema?: SchemaDefinition): T | undefined {
    if (this.isJSON()) {
      return this.readJSONSync<T>();
    } else if (this.isYaml()) {
      return this.readYamlSync<T>(schema);
    } else {
      throw new Error(`Unrecognized file format: ${this.path}`);
    }
  }

  private readJSONSync<T>(): T | undefined {
    let rval: T | undefined;
    try {
      rval = JSON.parse(this.read());
    } catch (e) {
      console.error(`Error reading JSON file[${this.path}]: ${e}`);
    }
    return rval;
  }

  public read(): string {
    const rval = this.fileSystem.read(this.path);
    if (!rval) {
      throw new Error(`File not found: ${this.path}`);
    }
    return rval ? rval.toString(FileReferenceImpl.DEFAULT_STRING_ENCODING) : '';
  }

  private readYamlSync<T>(schema?: SchemaDefinition): T | undefined {
    let rval: T | undefined;
    try {
      rval = yaml.load(this.read(), schema ? { schema } : undefined);
    } catch (e) {
      console.error(`Error reading YAML file[${this.path}]: ${e}`);
    }
    return rval;
  }

  public replaceTokens(values: Record<string, string>): FileReference {
    let rval = this.read();
    Object.keys(values).forEach((token) => {
      rval = rval.replace(new RegExp(`\\$\{${token}}`, 'g'), values[token]);
    });
    return this.write(rval);
  }

  public writeObjectSync(obj: unknown, schema?: SchemaDefinition): FileReference {
    let serialized: string;
    if (this.isJSON()) {
      serialized = JSON.stringify(obj, null, 2);
    } else if (this.isYaml()) {
      serialized = yaml.dump(obj, schema ? { schema } : undefined);
    } else {
      throw new Error(`Unrecognized file format: ${this.path}`);
    }
    return this.write(serialized);
  }

  public write(value: string): FileReference {
    this.fileSystem.write(this.path, Buffer.from(value, FileReferenceImpl.DEFAULT_STRING_ENCODING));
    return this;
  }
}
