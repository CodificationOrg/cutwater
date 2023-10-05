import { EventEmitter } from 'node:events';
import { resolve } from 'path';
import { ReadStream, WriteStream } from 'tty';

import { TrackedIOStreams } from './TrackedIOStreams';

export interface LimitedProcess
  extends Pick<
    NodeJS.Process,
    'cwd' | 'stdin' | 'stdout' | 'stderr' | 'version' | 'env' | 'exit'
  > {
  on: (
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ) => LimitedProcess;
}

export interface ProcessResponses {
  cwd?: string;
  version?: string;
  env?: Record<string, string>;
  stdin?: ReadStream & { fd: 0 };
  stdout?: WriteStream & { fd: 1 };
  stderr?: WriteStream & { fd: 2 };
}

export class Process implements LimitedProcess {
  public static createNull(
    responses: ProcessResponses = { ...new TrackedIOStreams() }
  ): LimitedProcess {
    return new Process(new StubbedProcessProvider(responses));
  }

  public static create(): LimitedProcess {
    return new Process({
      ...process,
      on: (
        event: string | symbol,
        listener: (...args: unknown[]) => void
      ): LimitedProcess => {
        process.on(event, listener);
        return this as unknown as LimitedProcess;
      },
    });
  }

  constructor(protected readonly process: LimitedProcess) {}

  public on(
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ): LimitedProcess {
    this.process.on(event, listener);
    return this;
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
  public readonly stdout: WriteStream & { fd: 1 };
  public readonly stdin: ReadStream & { fd: 0 };
  public readonly stderr: WriteStream & { fd: 2 };
  private readonly emitter = new EventEmitter();

  constructor(private readonly responses: ProcessResponses) {
    this.stdin = responses.stdin as ReadStream & { fd: 0 };
    this.stdout = responses.stdout as WriteStream & { fd: 1 };
    this.stderr = responses.stderr as WriteStream & { fd: 2 };
  }

  public on(
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ): LimitedProcess {
    this.emitter.on(event, listener);
    return this;
  }

  public cwd(): string {
    return this.responses.cwd || resolve('/project/packages/package1');
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
