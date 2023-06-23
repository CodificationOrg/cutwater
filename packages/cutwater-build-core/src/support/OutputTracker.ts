import { EventEmitter } from 'events';

export class OutputTracker {
  public static create(emitter: EventEmitter, event: string): OutputTracker {
    return new OutputTracker(emitter, event);
  }

  private readonly buffer: string[] = [];
  private readonly trackerFn = (data: string) => {
    this.buffer.push(data);
  };

  private constructor(private readonly emitter: EventEmitter, private readonly event: string) {
    this.emitter.on(this.event, this.trackerFn);
  }

  get data(): string[] {
    return this.buffer;
  }

  clear(): string[] {
    const result = [...this.buffer];
    this.buffer.length = 0;
    return result;
  }

  stop() {
    this.emitter.off(this.event, this.trackerFn);
  }
}
