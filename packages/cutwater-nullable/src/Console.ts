import { EventEmitter } from 'node:events';

import { OutputTracker } from './OutputTracker';

export class Console {
  public static create() {
    return new Console();
  }

  public static createNull() {
    return new Console(true);
  }

  private readonly emitter: EventEmitter = new EventEmitter();
  private static readonly OUTPUT_EVENT: string = 'consoleOutput';

  private constructor(private readonly isNulled = false) {}

  public trackOutput(): OutputTracker {
    return OutputTracker.create(this.emitter, Console.OUTPUT_EVENT);
  }

  public log(message?: unknown, ...optionalParams: unknown[]): void {
    if (!this.isNulled) {
      console.log(message, ...optionalParams);
    }
    this.emitter.emit(
      Console.OUTPUT_EVENT,
      JSON.stringify({
        message,
        optionalParams,
      })
    );
  }
}
