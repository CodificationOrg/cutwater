import { default as Ajv } from 'ajv';
import * as eos from 'end-of-stream';
import * as gulp from 'gulp';
import * as path from 'path';
import * as through2 from 'through2';
import * as Vinyl from 'vinyl';

import { BuildConfig } from '../BuildConfig';
import { BuildContext } from '../BuildContext';
import { ExecutableTask } from '../ExecutableTask';
import { getLogger, Logger } from '../logging/Logger';
import { IOUtils } from '../utilities/IOUtils';

export abstract class GulpTask<T> implements ExecutableTask {
  public name: string;
  public buildConfig: BuildConfig;
  public config: T;
  public cleanMatch: string[];
  public enabled: boolean = true;
  private taskSchema: object | undefined;

  public constructor(name: string, initialTaskConfig: Partial<T> = {}) {
    this.name = name;
    this.setConfig(initialTaskConfig);
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return (!buildConfig || !buildConfig.isRedundantBuild) && this.enabled;
  }

  public get schema(): object | undefined {
    return this.taskSchema ? this.taskSchema : (this.taskSchema = this.loadSchema());
  }

  public setConfig(taskConfig: Partial<T>): void {
    this.config = { ...this.config, ...taskConfig };
  }

  public replaceConfig(taskConfig: T): void {
    this.config = taskConfig;
  }

  public onRegister(): void {
    const configFilename: string = this.getConfigFilePath();
    const schema: object | undefined = this.schema;

    const rawConfig: T | undefined = this.readConfigFile(configFilename, schema);

    if (rawConfig) {
      this.setConfig(rawConfig);
    }
  }

  public abstract executeTask(
    gulp: gulp.Gulp,
    completeCallback?: (error?: string | Error) => void,
  ): Promise<object | void> | NodeJS.ReadWriteStream | void;

  public log(message: string): void {
    this.logger().log(`[${this.name.cyan}] ${message}`);
  }

  public logVerbose(message: string): void {
    this.logger().verbose(`[${this.name.cyan}] ${message}`);
  }

  public logWarning(message: string): void {
    this.logger().warn(`[${this.name.cyan}] ${message}`);
  }

  public logError(message: string): void {
    this.logger().error(`[${this.name.cyan}] ${message}`);
  }

  public fileError(filePath: string, line: number, column: number, errorCode: string, message: string): void {
    this.logger().fileError(this.name, filePath, line, column, errorCode, message);
  }

  public fileWarning(filePath: string, line: number, column: number, warningCode: string, message: string): void {
    this.logger().fileWarning(this.name, filePath, line, column, warningCode, message);
  }

  public getCleanMatch(buildConfig: BuildConfig, taskConfig: T = this.config): string[] {
    return this.cleanMatch;
  }

  public execute(context: BuildContext): Promise<void> {
    this.buildConfig = context.buildConfig;

    const startTime: [number, number] = process.hrtime();

    this.logger().logStartSubtask(this.name);

    return new Promise((resolve, reject) => {
      let stream;

      try {
        if (!this.executeTask) {
          throw new Error('The task subclass is missing the "executeTask" method.');
        }

        stream = this.executeTask(this.buildConfig.gulp, (err?: string | Error) => {
          if (!err) {
            resolve();
          } else if (typeof err === 'string') {
            reject(new Error(err));
          } else {
            reject(err);
          }
        });
      } catch (e) {
        this.logError(e);
        reject(e);
      }

      if (stream) {
        if (stream.then) {
          stream.then(resolve, reject);
        } else if (stream.pipe) {
          // wait for stream to end

          eos(
            stream,
            {
              error: true,
              readable: stream.readable,
              writable: stream.writable && !stream.readable,
            },
            (err: object) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            },
          );

          // Make sure the stream is completely read
          stream.pipe(
            through2.obj(
              (file: Vinyl, encoding: string, callback: (p?: object) => void) => {
                callback();
              },
              (callback: () => void) => {
                callback();
              },
            ),
          );
        } else if (this.executeTask.length === 1) {
          resolve(stream);
        }
      } else if (this.executeTask.length === 1) {
        resolve(stream);
      }
    }).then(
      () => {
        this.logger().logEndSubtask(this.name, startTime);
      },
      ex => {
        this.logger().logEndSubtask(this.name, startTime, ex);
        throw ex;
      },
    );
  }

  protected loadSchema(): object | undefined {
    return undefined;
  }

  protected getConfigFilePath(): string {
    return path.join(process.cwd(), 'config', `${this.name}.json`);
  }

  protected logger(): Logger {
    return getLogger();
  }

  private readConfigFile(filePath: string, schema?: object): T | undefined {
    if (!IOUtils.fileExists(filePath)) {
      return undefined;
    } else {
      const rawData: T = IOUtils.readJSONSyncSafe(filePath);

      if (schema) {
        const ajv = new Ajv();
        if (!ajv.validate(schema, rawData)) {
          throw new Error(`Configuration error: ${ajv.errors}`);
        }
      }
      return rawData;
    }
  }
}
