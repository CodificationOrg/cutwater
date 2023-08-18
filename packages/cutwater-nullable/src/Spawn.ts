import { ChildProcess } from 'child_process';
import spawn from 'cross-spawn';
import { EventEmitter } from 'events';
import { delimiter, resolve } from 'path';
import spawnArgs from 'spawn-args';

import { OutputTracker } from './OutputTracker';
import { System } from './System';
import { TrackedDuplex } from './TrackedDuplex';

export interface SpawnOptions {
  command: string;
  args?: string | string[];
  stdin?: string;
  quiet?: boolean;
  ignoreErrors?: boolean;
  cwd?: string;
  env?: {
    [key: string]: string;
  };
  dryrun?: boolean;
  logger?: {
    verbose: (...args: string[]) => void;
  };
}

type SpawnFn = (command: string, args?: ReadonlyArray<string>, options?: any) => ChildProcess;

export interface SpawnResponse {
  output?: string;
  error?: string;
  exitCode?: number;
  processError?: Error;
}

export class Spawn {
  public static createNull(response: SpawnResponse = {}, system: System = System.createNull()): Spawn {
    return new Spawn(system, createStubbedSpawn(response));
  }

  public static create(): Spawn {
    return new Spawn(System.create(), spawn);
  }

  private readonly emitter = new EventEmitter();
  private static readonly OUTPUT_EVENT: string = 'runOutput';
  constructor(private readonly system: System, private readonly spawn: SpawnFn) {}

  public trackOutput(): OutputTracker {
    return OutputTracker.create(this.emitter, Spawn.OUTPUT_EVENT);
  }

  public async execute(options: SpawnOptions): Promise<Buffer> {
    if (options.dryrun) {
      const rval: string = this.getCommandText(options);
      this.system.stdout.write(rval + '\n');
      this.emitter.emit(Spawn.OUTPUT_EVENT, rval);
      return Buffer.from(rval, 'utf8');
    } else {
      const rval = await this.doExec(options);
      this.emitter.emit(Spawn.OUTPUT_EVENT, Buffer.from(rval).toString());
      return rval;
    }
  }

  private doExec(options: SpawnOptions): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const output: string[] = [];
      const stderr: string[] = [];
      const proc = this.spawnProccess(options);

      if (options.stdin && proc.stdin) {
        proc.stdin.write(options.stdin);
        proc.stdin.end();
      }

      proc.stdout?.on('data', (data) => {
        output.push(data);
        if (!options.quiet) {
          this.system.stdout.write(data);
        }
      });
      proc.stderr?.on('data', (chunk) => {
        stderr.push(chunk);
        if (!options.quiet) {
          this.system.stderr.write(chunk);
        }
      });

      // On error, throw the err back up the chain
      proc.on('error', (err) => {
        if (!options.ignoreErrors) {
          reject(err);
        } else {
          resolve(Buffer.from(output.join('\n'), 'binary'));
        }
      });

      // On exit, check the exit code and if it's good, then resolve
      proc.on('exit', (code) => {
        if (code !== null && code === 0) {
          resolve(Buffer.from(output.join('\n'), 'binary'));
        } else {
          if (!options.ignoreErrors) {
            reject(new Error(`Non-zero exit code of [${code}]: ${stderr.join('\n')}`));
          } else {
            resolve(Buffer.from(output.join('\n'), 'binary'));
          }
        }
      });
    });
  }

  private spawnProccess(options: SpawnOptions): ChildProcess {
    const cwd = options.cwd || this.system.cwd();
    if (options.logger) {
      options.logger.verbose('Executing command: %s', this.getCommandText(options));
    }
    return this.spawn(options.command, this.toArgs(options.args), {
      stdio: this.toStdio(options),
      cwd,
      env: this.toEnv(options),
    });
  }

  private getCommandText(options: SpawnOptions): string {
    const args = options.args && Array.isArray(options.args) ? options.args.join(' ') : options.args || '';
    return `${options.command}${args ? ' ' + args : args}`;
  }

  private toArgs(args: string | string[] = ''): string[] {
    if (typeof args === 'string') {
      return spawnArgs(args, { removequotes: 'always' });
    } else {
      return args;
    }
  }

  private toStdio(options: SpawnOptions): string[] {
    const ioSetting: string = options.quiet ? 'ignore' : 'inherit';
    return [options.stdin ? 'pipe' : 'ignore', 'pipe', ioSetting];
  }

  private toEnv(options: SpawnOptions): { [key: string]: string } {
    const cwd = options.cwd || this.system.cwd();
    return {
      ...this.system.env,
      PATH: `${this.system.env.PATH}${delimiter}${resolve(cwd, 'node_modules', '.bin')}`,
      ...options.env,
    };
  }
}

const createStubbedSpawn = (response: SpawnResponse): SpawnFn => {
  return () => {
    return new StubbedChildProcess(response) as unknown as ChildProcess;
  };
};

class StubbedChildProcess extends EventEmitter {
  public readonly stdin = undefined;
  public readonly stdout = new TrackedDuplex();
  public readonly stderr = new TrackedDuplex();

  constructor(private response: SpawnResponse) {
    super();
    if (response.output) {
      this.stdout.write(response.output);
    } else if (response.error) {
      this.stderr.write(response.error);
    }
    setImmediate(() => {
      if (this.response.processError) {
        this.emit('error', this.response.processError);
      } else {
        const exitCode = this.response.exitCode !== undefined ? this.response.exitCode : this.response.error ? 1 : 0;
        this.emit('exit', exitCode);
      }
    });
  }
}
