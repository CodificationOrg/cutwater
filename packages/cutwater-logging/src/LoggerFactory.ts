import { Config } from '@codification/cutwater-core';
import { OutputTracker } from '@codification/cutwater-nullable';
import * as util from 'node:util';

import { Appender } from './Appender';
import { ConsoleAppender } from './ConsoleAppender';
import { Level } from './Level';
import { Logger } from './Logger';
import { LoggingEvent } from './LoggingEvent';
import EventEmitter = require('node:events');

type LoggerLevelFunction = (...input: unknown[]) => boolean;

/**
 * The source and single point of management for [[Logger]] instances.
 *
 * @beta
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
  public static readonly ENV_LOGGING_LEVEL_PREFIX: string =
    LoggerFactory.ENV_LOGGING_LEVEL + '_';

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
  public static readonly DEFAULT_LOGGING_LEVEL: Level = Level.ERROR;

  /**
   * The [[Level]] used by all [[Logger]] instances that do not have one specified.
   */
  public static GLOBAL_LEVEL: Level;
  /**
   * The [[Appender]] used by all [[Logger]] instances that do not have one specified.
   */
  public static GLOBAL_APPENDER: Appender = new ConsoleAppender();

  public static createNullable(
    loggerName: string = this.DEFAULT_LOGGER
  ): Logger {
    this.init();

    let rval: Logger = this.LOGGERS[loggerName];
    if (!rval) {
      rval = this.initialize(new DefaultLoggerImpl(loggerName, true));
      this.LOGGERS[loggerName] = rval;
    }

    return rval;
  }

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

  private static LOGGERS: Record<string, Logger> = {};

  private static init(): void {
    if (!this.GLOBAL_LEVEL) {
      this.GLOBAL_LEVEL = Level.toLevel(
        Config.get(this.ENV_LOGGING_LEVEL),
        this.DEFAULT_LOGGING_LEVEL
      );
    }
  }

  private static initialize(logger: DefaultLoggerImpl): Logger {
    const levelName: string = Config.get(
      this.ENV_LOGGING_LEVEL_PREFIX + logger.name
    );
    if (levelName) {
      logger.level = Level.toLevel(levelName);
    }
    return logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}
}

const OUTPUT_EVENT = 'output';

/**
 * @ignore
 */
class DefaultLoggerImpl implements Logger {
  private readonly emiiter = new EventEmitter();

  private loggerName: string;
  private loggerLevel = LoggerFactory.GLOBAL_LEVEL;
  private loggerAppender = LoggerFactory.GLOBAL_APPENDER;

  constructor(name: string, private skipAppender = false) {
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
    return !this.loggerAppender
      ? LoggerFactory.GLOBAL_APPENDER
      : this.loggerAppender;
  }

  set appender(appender: Appender) {
    this.loggerAppender = appender;
  }

  public fatal(...input: unknown[]): boolean {
    return this.doLog(Level.FATAL, input);
  }

  public error(...input: unknown[]): boolean {
    return this.doLog(Level.ERROR, input);
  }

  public warn(...input: unknown[]): boolean {
    return this.doLog(Level.WARN, input);
  }

  public info(...input: unknown[]): boolean {
    return this.doLog(Level.INFO, input);
  }

  public log(...input: unknown[]): boolean {
    return this.doLog(Level.DEBUG, input);
  }

  public debug(...input: unknown[]): boolean {
    return this.doLog(Level.DEBUG, input);
  }

  public trace(...input: unknown[]): boolean {
    return this.doLog(Level.TRACE, input);
  }

  public isEnabled(level: Level): boolean {
    return this.level.isGreaterOrEqual(level);
  }

  public logEnabledLevels(): void {
    Level.LEVELS.forEach((level) => {
      const levelFunctionName = level.name.toLowerCase() as keyof typeof this;
      (this[levelFunctionName] as LoggerLevelFunction)(
        `${level.name}: ENABLED`
      );
    });
  }

  public trackOutput(): OutputTracker {
    return OutputTracker.create(this.emiiter, OUTPUT_EVENT);
  }

  private doLog(level: Level, input: unknown[]): boolean {
    const rval: boolean = this.isEnabled(level);
    if (rval) {
      const event = new LoggingEvent(
        this,
        level,
        util.format.apply(undefined, input)
      );
      if (!this.skipAppender) {
        this.appender.doAppend(event);
      }
      this.emiiter.emit(
        OUTPUT_EVENT,
        JSON.stringify({ level: event.level, message: event.message })
      );
    }
    return rval;
  }
}
