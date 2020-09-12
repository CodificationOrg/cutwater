import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { SchemaDefinition } from 'js-yaml';
import * as path from 'path';
import { BuildConfig } from '../BuildConfig';
import { getLogger } from '../logging/Logger';

export class IOUtils {
  public static resolvePath(localPath: string, buildConfig?: BuildConfig): string {
    let rval: string = path.resolve(localPath);
    if (!path.isAbsolute(localPath) && buildConfig) {
      rval = path.resolve(path.join(buildConfig.rootPath, localPath));
    }
    return rval;
  }

  public static mkdirs(localPath: string, buildConfig?: BuildConfig): void {
    const dirsPath = this.resolvePath(localPath, buildConfig);
    if (!fs.existsSync(dirsPath)) {
      fs.mkdirSync(dirsPath, { recursive: true });
    }
  }

  public static rmdirs(localPath: string, buildConfig?: BuildConfig): void {
    const dirsPath = this.resolvePath(localPath, buildConfig);
    if (fs.existsSync(dirsPath)) {
      fs.readdirSync(dirsPath).forEach(name => {
        const p = path.join(dirsPath, name);
        if (fs.statSync(p).isFile()) {
          fs.unlinkSync(p);
        } else {
          this.rmdirs(p);
        }
      });
      fs.rmdirSync(dirsPath);
    }
  }

  public static fileExists(localPath: string, buildConfig?: BuildConfig): boolean {
    const fullPath: string = this.resolvePath(localPath, buildConfig);
    return fs.existsSync(fullPath);
  }

  public static copyFile(localSourcePath: string, localDestPath?: string, buildConfig?: BuildConfig): void {
    const fullSourcePath: string = path.resolve(__dirname, localSourcePath);
    const destPath = localDestPath || path.basename(localSourcePath);
    const fullDestPath: string = buildConfig ? path.resolve(buildConfig.rootPath, destPath) : destPath;
    fs.copyFileSync(fullSourcePath, fullDestPath);
  }

  public static isJSON(file: string): boolean {
    return file.toLowerCase().endsWith(IOUtils.JSON);
  }

  public static isYaml(file: string): boolean {
    return IOUtils.YAML.find(ext => file.toLowerCase().endsWith(ext)) !== undefined;
  }

  public static readObjectFromFileSyncSafe<T>(
    localPath: string,
    buildConfig?: BuildConfig,
    schema?: SchemaDefinition,
  ): T {
    const rval: T | undefined = this.readObjectFromFileSync<T>(localPath, buildConfig, schema);
    if (!rval) {
      throw new Error(`Failed to read required object file: ${this.resolvePath(localPath, buildConfig)}`);
    }
    return rval;
  }

  public static readObjectFromFileSync<T>(
    localPath: string,
    buildConfig?: BuildConfig,
    schema?: SchemaDefinition,
  ): T | undefined {
    if (IOUtils.isJSON(localPath)) {
      return IOUtils.readJSONSync<T>(localPath, buildConfig);
    } else if (IOUtils.isYaml(localPath)) {
      return IOUtils.readYamlSync<T>(localPath, buildConfig, schema);
    } else {
      throw new Error(`Unrecognized file format: ${this.resolvePath(localPath, buildConfig)}`);
    }
  }

  public static readJSONSyncSafe<T>(localPath: string, buildConfig?: BuildConfig): T {
    const rval: T | undefined = this.readJSONSync<T>(localPath, buildConfig);
    if (!rval) {
      throw new Error(`Failed to read required JSON file: ${localPath}`);
    }
    return rval;
  }

  public static readJSONSync<T>(localPath: string, buildConfig?: BuildConfig): T | undefined {
    let rval: T | undefined;
    try {
      rval = JSON.parse(this.readToString(localPath, buildConfig));
    } catch (e) {
      getLogger().error(`Error reading JSON file[${this.resolvePath(localPath, buildConfig)}]: ${e}`);
    }
    return rval;
  }

  public static readToString(localPath: string, buildConfig?: BuildConfig): string {
    return fs.readFileSync(this.resolvePath(localPath, buildConfig), { encoding: 'utf8' });
  }

  public static readYamlSyncSafe<T>(localPath: string, buildConfig?: BuildConfig): T {
    const rval: T | undefined = this.readYamlSync<T>(localPath, buildConfig);
    if (!rval) {
      throw new Error(`Failed to read required YAML file: ${this.resolvePath(localPath, buildConfig)}`);
    }
    return rval;
  }

  public static readYamlSync<T>(
    localPath: string,
    buildConfig?: BuildConfig,
    schema?: SchemaDefinition,
  ): T | undefined {
    let rval: T | undefined;
    try {
      rval = yaml.load(this.readToString(localPath, buildConfig), schema ? { schema } : undefined);
    } catch (e) {
      getLogger().error(`Error reading YAML file[${this.resolvePath(localPath, buildConfig)}]: ${e}`);
    }
    return rval;
  }

  public static writeObjectToFileSync(
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
    IOUtils.writeToFile(serialized, localPath, buildConfig);
  }

  public static writeToFile(value: string, localPath: string, buildConfig?: BuildConfig): void {
    fs.writeFileSync(this.resolvePath(localPath, buildConfig), value, { encoding: 'utf8' });
  }

  public static afterStreamsFlushed(fastExit: boolean, callback: () => void): void {
    this.afterStreamFlushed('stdout', fastExit, () => {
      this.afterStreamFlushed('stderr', fastExit, () => {
        callback();
      });
    });
  }

  public static afterStreamFlushed(streamName: string, fastExit: boolean, callback: () => void): void {
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

  private static readonly JSON: string = 'json';
  private static readonly YAML: string[] = ['yaml', 'yml'];
}
