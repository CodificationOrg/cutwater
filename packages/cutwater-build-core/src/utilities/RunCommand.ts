import { default as spawn } from 'cross-spawn';
import { delimiter, resolve as pathResolve } from 'path';
import { default as spawnArgs } from 'spawn-args';
import { Logger } from '../logging/Logger';

export interface RunCommandConfig {
  command: string;
  args?: string | string[];
  quiet?: boolean;
  ignoreErrors?: boolean;
  cwd?: string;
  env?: {
    [key: string]: string;
  };
  dryrun?: boolean;
  logger?: Logger;
}

export class RunCommand {
  public async run(config: RunCommandConfig): Promise<Buffer> {
    if (config.dryrun) {
      const rval: string = this.getCommandText(config);
      process.stdout.write(rval + '\n');
      return Buffer.from(rval, 'utf8');
    } else {
      return await this.doExec(config);
    }
  }

  private doExec(config: RunCommandConfig): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let output = '';
      const proc = this.spawnProccess(config);

      proc.stdout.on('data', (data) => {
        output += data;
        if (!config.quiet) {
          process.stdout.write(data);
        }
      });

      // On error, throw the err back up the chain
      proc.on('error', (err) => {
        if (!config.ignoreErrors) {
          reject(err);
        } else {
          resolve(Buffer.alloc(0));
        }
      });

      // On exit, check the exit code and if it's good, then resolve
      proc.on('exit', (code) => {
        if (parseInt(code, 10) === 0) {
          resolve(Buffer.from(output, 'binary'));
        } else {
          if (!config.ignoreErrors) {
            reject(new Error(`Non-zero exit code of "${code}"`));
          } else {
            resolve(Buffer.alloc(0));
          }
        }
      });
    });
  }

  private spawnProccess(config: RunCommandConfig): spawn {
    const cwd = config.cwd || process.cwd();
    if (config.logger) {
      config.logger.verbose('Executing command: %s', this.getCommandText(config));
    }
    return spawn(config.command, this.toArgs(config.args), {
      stdio: this.toStdio(config.quiet || false),
      cwd,
      env: this.toEnv(config),
    });
  }

  private getCommandText(config: RunCommandConfig): string {
    const args = config.args && Array.isArray(config.args) ? config.args.join(' ') : config.args || '';
    return `${config.command}${args ? ' ' + args : args}`;
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
    return ['ignore', 'pipe', ioSetting];
  }

  private toEnv(config: RunCommandConfig): { [key: string]: string } {
    const cwd = config.cwd || process.cwd();
    return {
      ...process.env,
      PATH: `${process.env.PATH}${delimiter}${pathResolve(cwd, 'node_modules', '.bin')}`,
      ...config.env,
    };
  }
}
