import * as path from 'path';
import { default as prettyTime } from 'pretty-hrtime';
import { getFlagValue } from '../State';
import { duration as elapsed, error, label, msg, warn } from '../support/ColorUtils';

export class Logger {
  public static timestamp(): string {
    const currentTime: Date = new Date();
    return [
      this.toTimePart(currentTime.getHours()),
      this.toTimePart(currentTime.getMinutes()),
      this.toTimePart(currentTime.getSeconds()),
    ].join(':');
  }

  public static toTimePart(part: number): string {
    return `${part < 10 ? '0' : ''}${part.toString(10)}`;
  }

  private readonly WROTE_ERROR_KEY: string = '__gulpCutwaterCoreBuildWroteError';

  public isVerboseEnabled(): boolean {
    return getFlagValue('verbose');
  }

  public verbose(...args: string[]): void {
    if (this.isVerboseEnabled()) {
      this.log(...args);
    }
  }

  public warn(...args: string[]): void {
    args.splice(0, 0, 'Warning -');
    this.log(...this.colorizeAll(warn, args));
  }

  public error(...args: string[]): void {
    args.splice(0, 0, 'Error -');
    this.log(...this.colorizeAll(error, args));
  }

  public log(...args: string[]): void {
    console.log(`[${msg(Logger.timestamp())}] ${args.join('')}`);
  }

  public fileWarning(
    taskName: string,
    filePath: string,
    line: number,
    column: number,
    errorCode: string,
    message: string,
  ): void {
    this.fileLog(this.warn, taskName, filePath, line, column, errorCode, message);
  }

  public fileError(
    taskName: string,
    filePath: string,
    line: number,
    column: number,
    errorCode: string,
    message: string,
  ): void {
    this.fileLog(this.error, taskName, filePath, line, column, errorCode, message);
  }

  public fileLog(
    write: (text: string) => void,
    taskName: string,
    filePath: string,
    line: number,
    column: number,
    errorCode: string,
    message: string,
  ): void {
    if (!filePath) {
      filePath = '<undefined path>';
    } else if (path.isAbsolute(filePath)) {
      filePath = path.relative(process.cwd(), filePath);
    }
    write(`${label(taskName)} - ${filePath}(${line},${column}): error ${errorCode}: ${message}`);
  }

  public logStartSubtask(name: string): void {
    this.log(`Starting subtask '${label(name)}'...`);
  }

  public logEndSubtask(name: string, startTime: [number, number], errorObject?: Error): void {
    const duration: [number, number] = process.hrtime(startTime);
    if (name) {
      if (!errorObject) {
        const durationString: string = prettyTime(duration);
        this.log(`Finished subtask '${label(name)}' after ${elapsed(durationString)}`);
      } else {
        this.writeError({
          err: errorObject,
          task: name,
          subTask: true,
          hrDuration: duration,
        });
      }
    }
  }

  public writeTaskError(e: any): void {
    if (!e || !(e.err && e.err[this.WROTE_ERROR_KEY])) {
      this.writeError(e);
    }
  }

  public writeError(e: any): void {
    if (e) {
      if (!e[this.WROTE_ERROR_KEY]) {
        if (e.err) {
          if (!e.err[this.WROTE_ERROR_KEY]) {
            const msg: string | undefined = this.formatError(e);
            const time: string = prettyTime(e.hrDuration);

            this.error(
              "'" + e.task.cyan + "'",
              error(e.subTask ? 'sub task errored after' : 'errored after'),
              elapsed(time),
              '\r\n',
              msg || '',
            );
            this.markErrorAsWritten(e.err[this.WROTE_ERROR_KEY]);
          }
        } else if (e.fileName) {
          // This is probably a plugin error
          if (this.isVerboseEnabled()) {
            this.error(e.message, '\r\n', e.plugin + ": '" + e.fileName.yellow + "':" + e.lineNumber, '\r\n', e.stack);
          } else {
            this.error(e.message, '\r\n', e.plugin + ": '" + e.fileName.yellow + "':" + e.lineNumber);
          }
        } else {
          if (this.isVerboseEnabled()) {
            this.error('Unknown', '\r\n', e.message.red, '\r\n', e.stack);
          } else {
            this.error('Unknown', '\r\n', e.message.red);
          }
        }
        this.markErrorAsWritten(e);
      }
    } else {
      this.error('Unknown Error Object');
    }
  }

  public markErrorAsWritten(err: Error): void {
    try {
      err[this.WROTE_ERROR_KEY] = true;
    } catch (e) {
      // Do Nothing
    }
  }

  private colorizeAll(color: (value: string) => string, args: string[]): string[] {
    return args.map((arg) => color(arg));
  }

  private formatError(e: any): string | undefined {
    if (!e.err) {
      if (this.isVerboseEnabled()) {
        return `${e.message}\r\n${e.stack}`;
      } else {
        return e.message;
      }
    }

    // PluginError
    if (typeof e.err.showStack === 'boolean') {
      return `${e.err.toString()}${e.err.stack && this.isVerboseEnabled() ? '\r\n' + e.err.stack : ''}`;
    }

    // normal error
    if (e.err.stack) {
      if (this.isVerboseEnabled()) {
        return e.err.stack;
      } else {
        return e.err.message;
      }
    }

    // unknown (string, number, etc.)
    if (typeof Error === 'undefined') {
      if (this.isVerboseEnabled()) {
        return `${e.message}\r\n${e.stack}`;
      } else {
        return e.message;
      }
    } else {
      let output = String(e.err);

      try {
        output = JSON.stringify(e.err);
      } catch (e) {
        // Do nothing
      }

      if (this.isVerboseEnabled()) {
        return new Error(output).stack;
      } else {
        return new Error(output).message;
      }
    }
  }
}

const LOG = new Logger();

export const getLogger = (): Logger => LOG;
