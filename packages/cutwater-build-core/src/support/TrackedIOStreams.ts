import EventEmitter from 'node:events';
import { ReadStream, WriteStream } from 'node:tty';
import { OutputTracker } from './OutputTracker';
import { TrackedDuplex } from './TrackedDuplex';

export class TrackedIOStreams {
  public readonly stdin: ReadStream & { fd: 0 };
  public readonly stdout: WriteStream & { fd: 1 };
  public readonly stderr: WriteStream & { fd: 2 };

  private readonly emitter: EventEmitter = new EventEmitter();

  public constructor() {
    this.stdin = new TrackedDuplex(this.emitter, 0) as ReadStream & { fd: 0 };
    this.stdout = new TrackedDuplex(this.emitter, 1) as WriteStream & { fd: 1 };
    this.stderr = new TrackedDuplex(this.emitter, 2) as WriteStream & { fd: 2 };
  }

  public trackOutput(): OutputTracker {
    return OutputTracker.create(this.emitter, TrackedDuplex.OUTPUT_EVENT);
  }
}
