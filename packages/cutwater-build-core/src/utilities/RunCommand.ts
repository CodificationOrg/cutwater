import { default as spawn } from 'cross-spawn';
import { delimiter, resolve as pathResolve } from 'path';
import { default as spawnArgs } from 'spawn-args';

export interface RunCommandConfig {
  command: string;
  args?: string | string[];
  quiet?: boolean;
  ignoreErrors?: boolean;
  cwd?: string;
  env?: {
    [key: string]: string;
  };
}

export class RunCommand {
  public run(config: RunCommandConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = this.spawnProccess(config);

      // On error, throw the err back up the chain
      proc.on('error', err => {
        if (!config.ignoreErrors) {
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
          if (!config.ignoreErrors) {
            reject(new Error(`Non-zero exit code of "${code}"`));
          } else {
            resolve();
          }
        }
      });
    });
  }

  private spawnProccess(config: RunCommandConfig): spawn {
    const cwd = config.cwd || process.cwd();
    return spawn(config.command, this.toArgs(config.args), {
      stdio: this.toStdio(config.quiet || false),
      cwd,
      env: this.toEnv(config),
    });
  }

  private toArgs(args: string | string[] = ''): string[] {
    if (typeof args === 'string') {
      return spawnArgs(args, { removequotes: 'always' });
    } else {
      return args;
    }
  }

  private toStdio(quiet: boolean): string[] {
    const ioSetting: string = quiet ? 'ignore' : 'inherit';
    return ['ignore', ioSetting, ioSetting];
  }

  private toEnv(
    config: RunCommandConfig,
  ): {
    [key: string]: string;
  } {
    const cwd = config.cwd || process.cwd();
    return {
      ...process.env,
      PATH: `${process.env.PATH}${delimiter}${pathResolve(cwd, 'node_modules', '.bin')}`,
      ...config.env,
    };
  }
}
