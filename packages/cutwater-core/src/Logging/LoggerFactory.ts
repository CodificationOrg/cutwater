import * as util from 'util';

import { Config } from '../Config';
import { Appender } from './Appender';
import { ConsoleAppender } from './ConsoleAppender';
import { Level } from './Level';
import { Logger } from './Logger';
import { LoggingEvent } from './LoggingEvent';

export class LoggerFactory {
  public static readonly ENV_LOGGING_LEVEL = 'LOGGING_LEVEL';
  public static readonly ENV_LOGGING_LEVEL_PREFIX = LoggerFactory.ENV_LOGGING_LEVEL + '_';

  public static readonly DEFAULT_LOGGER = 'DEFAULT';
  public static readonly DEFAULT_LOGGING_LEVEL = 'ERROR';

  public static GLOBAL_LEVEL: Level;
  public static GLOBAL_APPENDER: Appender = new ConsoleAppender();

  public static getLogger(loggerName: string = this.DEFAULT_LOGGER): Logger {
    this.init();

    let rval: Logger = this.LOGGERS[loggerName];
    if (!rval) {
      rval = this.initialize(new DefaultLoggerImpl(loggerName));
      this.LOGGERS[loggerName] = rval;
    }

    return rval;
  }

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
