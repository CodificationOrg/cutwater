import yaml, { SchemaDefinition } from 'js-yaml';
import { basename, isAbsolute, join, resolve } from 'path/win32';

import { BuildConfig } from '../types';
import { FileSystem } from './FileSystem';

export class FileSystemService {
  public static create(): FileSystemService {
    return new FileSystemService(FileSystem.create());
  }

  public static createNull(fileSystem: FileSystem = FileSystem.createNull()): FileSystemService {
    return new FileSystemService(fileSystem);
  }

  private static readonly JSON: string = 'json';
  private static readonly YAML: string[] = ['yaml', 'yml'];
  private static readonly DEFAULT_STRING_ENCODING = 'utf-8';

  private constructor(private readonly fileSystem: FileSystem) {}

  public resolvePath(localPath: string, buildConfig?: BuildConfig): string {
    let rval: string = resolve(localPath);
    if (!isAbsolute(localPath) && buildConfig) {
      rval = resolve(join(buildConfig.rootPath, localPath));
    }
    return rval;
  }

  public mkdirs(localPath: string, buildConfig?: BuildConfig): void {
    const dirsPath = this.resolvePath(localPath, buildConfig);
    if (!this.fileSystem.exists(dirsPath)) {
      this.fileSystem.mkdir(dirsPath, true);
    }
  }

  public rmdirs(localPath: string, buildConfig?: BuildConfig): void {
    const dirPath = this.resolvePath(localPath, buildConfig);
    if (this.fileSystem.exists(dirPath)) {
      this.fileSystem.delete(dirPath, true);
    }
  }

  public fileExists(localPath: string, buildConfig?: BuildConfig): boolean {
    return this.fileSystem.exists(this.resolvePath(localPath, buildConfig));
  }

  public copyFile(localSourcePath: string, localDestPath?: string, buildConfig?: BuildConfig): void {
    const fullSourcePath: string = resolve(__dirname, localSourcePath);
    const destPath = localDestPath || basename(localSourcePath);
    const fullDestPath: string = buildConfig ? resolve(buildConfig.rootPath, destPath) : destPath;
    this.fileSystem.copy(fullSourcePath, fullDestPath);
  }

  public isJSON(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(FileSystemService.JSON);
  }

  public isYaml(fileName: string): boolean {
    return FileSystemService.YAML.find((ext) => fileName.toLowerCase().endsWith(ext)) !== undefined;
  }

  public readObjectFromFileSyncSafe<T>(localPath: string, buildConfig?: BuildConfig, schema?: SchemaDefinition): T {
    const rval: T | undefined = this.readObjectFromFileSync<T>(localPath, buildConfig, schema);
    if (!rval) {
      throw new Error(`Failed to read required object file: ${this.resolvePath(localPath, buildConfig)}`);
    }
    return rval;
  }

  public readObjectFromFileSync<T>(
    localPath: string,
    buildConfig?: BuildConfig,
    schema?: SchemaDefinition,
  ): T | undefined {
    if (this.isJSON(localPath)) {
      return this.readJSONSync<T>(localPath, buildConfig);
    } else if (this.isYaml(localPath)) {
      return this.readYamlSync<T>(localPath, buildConfig, schema);
    } else {
      throw new Error(`Unrecognized file format: ${this.resolvePath(localPath, buildConfig)}`);
    }
  }

  public readJSONSyncSafe<T>(localPath: string, buildConfig?: BuildConfig): T {
    const rval: T | undefined = this.readJSONSync<T>(localPath, buildConfig);
    if (!rval) {
      throw new Error(`Failed to read required JSON file: ${localPath}`);
    }
    return rval;
  }

  public readJSONSync<T>(localPath: string, buildConfig?: BuildConfig): T | undefined {
    let rval: T | undefined;
    try {
      rval = JSON.parse(this.readToString(localPath, buildConfig));
    } catch (e) {
      console.error(`Error reading JSON file[${this.resolvePath(localPath, buildConfig)}]: ${e}`);
    }
    return rval;
  }

  public readToString(localPath: string, buildConfig?: BuildConfig): string {
    const path = this.resolvePath(localPath, buildConfig);
    const rval = this.fileSystem.read(path);
    if (!rval) {
      throw new Error(`File not found: ${path}`);
    }
    return rval ? rval.toString(FileSystemService.DEFAULT_STRING_ENCODING) : '';
  }

  public readYamlSyncSafe<T>(localPath: string, buildConfig?: BuildConfig): T {
    const rval: T | undefined = this.readYamlSync<T>(localPath, buildConfig);
    if (!rval) {
      throw new Error(`Failed to read required YAML file: ${this.resolvePath(localPath, buildConfig)}`);
    }
    return rval;
  }

  public readYamlSync<T>(localPath: string, buildConfig?: BuildConfig, schema?: SchemaDefinition): T | undefined {
    let rval: T | undefined;
    try {
      rval = yaml.load(this.readToString(localPath, buildConfig), schema ? { schema } : undefined);
    } catch (e) {
      console.error(`Error reading YAML file[${this.resolvePath(localPath, buildConfig)}]: ${e}`);
    }
    return rval;
  }

  public replaceTokensInTextFile(localPath: string, values: Record<string, string>, buildConfig?: BuildConfig): void {
    let rval = this.readToString(localPath, buildConfig);
    Object.keys(values).forEach((token) => {
      rval = rval.replace(new RegExp(`\\$\{${token}}`, 'g'), values[token]);
    });
    this.writeToFile(rval, localPath, buildConfig);
  }

  public writeObjectToFileSync(
    obj: unknown,
    localPath: string,
    buildConfig?: BuildConfig,
    schema?: SchemaDefinition,
  ): void {
    let serialized: string;
    if (this.isJSON(localPath)) {
      serialized = JSON.stringify(obj, null, 2);
    } else if (this.isYaml(localPath)) {
      serialized = yaml.dump(obj, schema ? { schema } : undefined);
    } else {
      throw new Error(`Unrecognized file format: ${this.resolvePath(localPath, buildConfig)}`);
    }
    this.writeToFile(serialized, localPath, buildConfig);
  }

  public writeToFile(value: string, localPath: string, buildConfig?: BuildConfig): void {
    this.fileSystem.write(
      this.resolvePath(localPath, buildConfig),
      Buffer.from(value, FileSystemService.DEFAULT_STRING_ENCODING),
    );
  }

  public afterStreamsFlushed(fastExit: boolean, callback: () => void): void {
    this.afterStreamFlushed('stdout', fastExit, () => {
      this.afterStreamFlushed('stderr', fastExit, () => {
        callback();
      });
    });
  }

  public afterStreamFlushed(streamName: string, fastExit: boolean, callback: () => void): void {
    if (fastExit) {
      callback();
    } else {
      const stream: NodeJS.WritableStream = process[streamName];
      const outputWritten: boolean = stream.write('');
      if (outputWritten) {
        setTimeout(() => {
          callback();
        }, 250);
      } else {
        stream.once('drain', () => {
          setTimeout(() => {
            callback();
          }, 250);
        });
      }
    }
  }
}
