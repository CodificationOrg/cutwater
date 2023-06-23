import { resolve } from 'path';
import { ReadStream, WriteStream } from 'tty';

import EventEmitter from 'events';
import { TrackedIOStreams } from '../support/TrackedIOStreams';

export interface LimitedProcess
  extends Pick<NodeJS.Process, 'cwd' | 'stdin' | 'stdout' | 'stderr' | 'version' | 'env' | 'exit'> {
  dirname: string;
  on: (event: string | symbol, listener: (...args: any[]) => void) => LimitedProcess;
}

export interface ProcessResponses {
  cwd?: string;
  dirname?: string;
  version?: string;
  env?: Record<string, string>;
  stdin?: ReadStream & { fd: 0 };
  stdout?: WriteStream & { fd: 1 };
  stderr?: WriteStream & { fd: 2 };
}

export class Process implements LimitedProcess {
  public static createNull(responses: ProcessResponses = { ...new TrackedIOStreams() }): Process {
    return new Process(new StubbedProcessProvider(responses));
  }

  public static create(): Process {
    return new Process({
      ...process,
      dirname: __dirname,
      on: (event: string | symbol, listener: (...args: any[]) => void): LimitedProcess => {
        process.on(event, listener);
        return this as unknown as LimitedProcess;
      },
    });
  }

  constructor(private readonly process: LimitedProcess) {}

  public on(event: string | symbol, listener: (...args: any[]) => void): LimitedProcess {
    this.process.on(event, listener);
    return this;
  }

  public cwd(): string {
    return this.process.cwd();
  }

  public get dirname(): string {
    return this.process.dirname;
  }

  public get version(): string {
    return this.process.version;
  }

  public get env(): Record<string, string | undefined> {
    return this.process.env;
  }

  public exit(code?: number | undefined): never {
    return this.process.exit(code);
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
}

class StubbedProcessProvider implements LimitedProcess {
  public readonly stdout;
  public readonly stdin;
  public readonly stderr;
  private readonly emitter = new EventEmitter();

  constructor(private readonly responses: ProcessResponses) {
    this.stdin = responses.stdin;
    this.stdout = responses.stdout;
    this.stderr = responses.stderr;
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): LimitedProcess {
    this.emitter.on(event, listener);
    return this;
  }

  public cwd(): string {
    return this.responses.cwd || resolve('/project/packages/package1');
  }

  public get dirname(): string {
    return this.responses.dirname || '/';
  }

  public get version(): string {
    return this.responses.version || 'vNullable';
  }

  public get env(): Record<string, string | undefined> {
    return this.responses.env || {};
  }

  public exit(code?: number | undefined): never {
    this.emitter.emit('exit', code);
    throw Error(`Exited with code: ${code}`);
  }
}
