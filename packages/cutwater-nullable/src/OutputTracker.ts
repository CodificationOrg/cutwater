import { EventEmitter } from 'node:events';

export class OutputTracker<T = string> {
  public static readonly DEFAULT_EVENT = 'output';

  public static create<T>(
    emitter: EventEmitter,
    event = OutputTracker.DEFAULT_EVENT
  ): OutputTracker<T> {
    return new OutputTracker<T>(emitter, event);
  }

  private readonly buffer: T[] = [];
  private readonly trackerFn = (data: string) => {
    try {
      this.buffer.push(JSON.parse(data));
    } catch {
      this.buffer.push(data as T);
    }
  };

  private constructor(
    private readonly emitter: EventEmitter,
    private readonly event: string
  ) {
    this.emitter.on(this.event, this.trackerFn);
  }

  get data(): T[] {
    return this.buffer;
  }

  public clear(): T[] {
    const result = [...this.buffer];
    this.buffer.length = 0;
    return result;
  }

  public stop() {
    this.emitter.off(this.event, this.trackerFn);
  }
}
