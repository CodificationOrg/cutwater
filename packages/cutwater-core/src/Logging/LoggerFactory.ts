import * as util from 'util';

import { Config } from '../Config';
import { Appender } from './Appender';
import { ConsoleAppender } from './ConsoleAppender';
import { Level } from './Level';
import { Logger } from './Logger';
import { LoggingEvent } from './LoggingEvent';

/**
 * The source and single point of management for [[Logger]] instances.
 */
export class LoggerFactory {
  /**
   * The `key` in [[Config]] that will be checked for a default logging level.
   *
   * @readonly
   */
  public static readonly ENV_LOGGING_LEVEL: string = 'LOGGING_LEVEL';

  /**
   * The prefix for the `key` in [[Config]] that will be used to determine the logging level for
   * [[Logger]] instances with the name following the prefix.
   *
   * @readonly
   */
  public static readonly ENV_LOGGING_LEVEL_PREFIX: string = LoggerFactory.ENV_LOGGING_LEVEL + '_';

  /**
   * The name of the default [[Logger]].
   *
   * @readonly
   */
  public static readonly DEFAULT_LOGGER: string = 'DEFAULT';
  /**
   * The [[Level]] used if a default is not found under the `LOGGING_LEVEL` key in [[Config]].
   *
   * @readonly
   */
  public static readonly DEFAULT_LOGGING_LEVEL: string = 'ERROR';

  /**
   * The [[Level]] used by all [[Logger]] instances that do not have one specified.
   */
  public static GLOBAL_LEVEL: Level;
  /**
   * The [[Appender]] used by all [[Logger]] instances that do not have one specified.
   */
  public static GLOBAL_APPENDER: Appender = new ConsoleAppender();

  /**
   * Returns the [[Logger]] instance with the specified name.  If no name is provided, the default will be returned.
   * If a logger does not exist with the specified name, a new one will be created.
   *
   * @param loggerName - Name of the logger instance to be returned.
   */
  public static getLogger(loggerName: string = this.DEFAULT_LOGGER): Logger {
    this.init();

    let rval: Logger = this.LOGGERS[loggerName];
    if (!rval) {
      rval = this.initialize(new DefaultLoggerImpl(loggerName));
      this.LOGGERS[loggerName] = rval;
    }

    return rval;
  }

  /**
   * Causes the specified [[Logger]] to append a single message for each enabled [[Level]].
   *
   * @param logger - The logger to output levels for.
   */
  public static logEnabledLevels(logger: Logger): void {
    Level.LEVELS.forEach(level => {
      logger[level.name.toLowerCase()](`${level.name}: ENABLED`);
    });
  }

  private static LOGGERS = [];

  private static init(): void {
    if (!this.GLOBAL_LEVEL) {
      this.GLOBAL_LEVEL = Level.toLevel(Config.get(this.ENV_LOGGING_LEVEL, this.DEFAULT_LOGGING_LEVEL));
    }
    if (!this.GLOBAL_LEVEL) {
      this.GLOBAL_LEVEL = Level.toLevel(this.DEFAULT_LOGGING_LEVEL);
    }
  }

  private static initialize(logger: DefaultLoggerImpl): Logger {
    const levelName = Config.get(this.ENV_LOGGING_LEVEL_PREFIX + logger.name);
    if (levelName) {
      logger.level = Level.toLevel(levelName);
    }
    return logger;
  }

  private constructor() {}
}

/**
 * @ignore
 */
class DefaultLoggerImpl implements Logger {
  private loggerName: string;
  private loggerLevel: Level;
  private loggerAppender: Appender;

  constructor(name: string) {
    this.loggerName = name;
  }

  get name(): string {
    return this.loggerName;
  }

  get level(): Level {
    return !this.loggerLevel ? LoggerFactory.GLOBAL_LEVEL : this.loggerLevel;
  }

  set level(level: Level) {
    this.loggerLevel = level;
  }

  get appender(): Appender {
    return !this.loggerAppender ? LoggerFactory.GLOBAL_APPENDER : this.loggerAppender;
  }

  set appender(appender: Appender) {
    this.loggerAppender = appender;
  }

  public fatal(...input: any[]): boolean {
    return this.doLog(Level.FATAL, input);
  }

  public error(...input: any[]): boolean {
    return this.doLog(Level.ERROR, input);
  }

  public warn(...input: any[]): boolean {
    return this.doLog(Level.WARN, input);
  }

  public info(...input: any[]): boolean {
    return this.doLog(Level.INFO, input);
  }

  public log(...input: any[]): boolean {
    return this.doLog(Level.DEBUG, input);
  }

  public debug(...input: any[]): boolean {
    return this.doLog(Level.DEBUG, input);
  }

  public trace(...input: any[]): boolean {
    return this.doLog(Level.TRACE, input);
  }

  public isEnabled(level: Level) {
    return this.level.isGreaterOrEqual(level);
  }

  private doLog(level: Level, input: any[]): boolean {
    const rval = this.isEnabled(level);
    if (rval) {
      this.appender.doAppend(new LoggingEvent(this, level, util.format.apply(null, input)));
    }
    return rval;
  }
}
