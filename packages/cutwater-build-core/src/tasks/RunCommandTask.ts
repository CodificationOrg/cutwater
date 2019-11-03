import { default as spawn } from 'cross-spawn';
import * as gulp from 'gulp';
import { delimiter, resolve as pathResolve } from 'path';
import { default as spawnArgs } from 'spawn-args';

import { GulpTask } from './GulpTask';

export interface RunCommandTaskConfig {
  command: string;
  quiet: boolean;
  ignoreErrors: boolean;
  cwd: string;
  env?: {
    [key: string]: string;
  };
}

export class RunCommandTask<T extends RunCommandTaskConfig> extends GulpTask<T> {
  public constructor(taskName: string = 'run-command', defaultConfig: Partial<T> = {}) {
    super(taskName, {
      quiet: false,
      ignoreErrors: false,
      cwd: process.cwd(),
      env: {},
      ...defaultConfig,
    } as T);
  }

  public executeTask(localGulp: gulp.Gulp): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = this.spawnProccess();

      // On error, throw the err back up the chain
      proc.on('error', err => {
        if (!this.config.ignoreErrors) {
          reject(err);
        } else {
          resolve();
        }
      });

      // On exit, check the exit code and if it's good, then resolve
      proc.on('exit', code => {
        if (parseInt(code, 10) === 0) {
          resolve();
        } else {
          if (!this.config.ignoreErrors) {
            reject(new Error(`Non-zero exit code of "${code}"`));
          } else {
            resolve();
          }
        }
      });
    });
  }

  protected preparedCommand(): string {
    return this.config.command;
  }

  private spawnProccess(): spawn {
    const cwd = this.config.cwd;
    return spawn(this.args.shift(), this.args, {
      stdio: this.stdio,
      cwd,
      env: this.env,
    });
  }

  private get args(): string[] {
    return spawnArgs(this.preparedCommand(), { removequotes: 'always' });
  }

  private get stdio(): string[] {
    const ioSetting: string = this.config.quiet ? 'ignore' : 'inherit';
    return ['ignore', ioSetting, ioSetting];
  }

  private get env(): {
    [key: string]: string;
  } {
    const cwd = this.config.cwd;
    return {
      ...process.env,
      PATH: process.env.PATH + delimiter + pathResolve(cwd, 'node_modules', '.bin'),
      ...this.config.env,
    };
  }
}
