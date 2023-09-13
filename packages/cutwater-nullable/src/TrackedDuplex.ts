import { EventEmitter } from 'node:events';
import { Socket } from 'net';
import { DuplexOptions } from 'stream';

import { OutputTracker } from './OutputTracker';

export class TrackedDuplex extends Socket {
  private raw: boolean;
  private readonly buffer: string[] = [];
  public static readonly OUTPUT_EVENT: string = 'duplexOutput';

  constructor(
    private readonly emitter: EventEmitter = new EventEmitter(),
    public readonly fd = 0,
    public readonly isTTY = false,
    options?: DuplexOptions
  ) {
    super(options);
    this.raw = false;
  }

  public trackOutput(): OutputTracker {
    return OutputTracker.create(this.emitter, TrackedDuplex.OUTPUT_EVENT);
  }

  public override _write(chunk: unknown): void {
    const value: string = Buffer.isBuffer(chunk)
      ? chunk.toString()
      : (chunk as string);
    this.buffer.push(value);
    this.emitter.emit(TrackedDuplex.OUTPUT_EVENT, value);
  }

  public override _read(): void {
    let ready = true;
    while (ready && this.buffer.length > 0) {
      ready = this.push(this.buffer.shift());
    }
  }

  public clearLine(): boolean {
    return true;
  }

  public clearScreenDown(): boolean {
    return true;
  }

  public cursorTo(): boolean {
    return true;
  }

  moveCursor(): boolean {
    return true;
  }

  getColorDepth(): number {
    return 24;
  }

  hasColors(): boolean {
    return true;
  }

  public getWindowSize(): [number, number] {
    return [80, 80];
  }

  public get columns(): number {
    return this.getWindowSize()[0];
  }

  public get rows(): number {
    return this.getWindowSize()[1];
  }

  public get isRaw(): boolean {
    return this.raw;
  }

  public setRawMode(mode: boolean): TrackedDuplex {
    this.raw = mode;
    return this;
  }
}
