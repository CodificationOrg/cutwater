interface NxLogger {
  warn(arg: unknown): void;
  error(arg: unknown): void;
  info(arg: unknown): void;
  log(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
}

export class LoggerAdapter {
  public static wrap(logger: NxLogger): LoggerAdapter {
    return new LoggerAdapter(logger);
  }

  private constructor(private readonly logger: NxLogger) {}

  public verbose(...args: string[]): void {
    this.logger.debug(args);
  }
}
