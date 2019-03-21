import { Appender } from './Appender';
import { Level } from './Level';

/**
 * A [[Logger]] is used to log messages for a specific system or application component.
 *
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface Logger {
  /**
   * The human readable name of this logger instance.
   */
  name: string;

  /**
   * The level at which this logger will output messages.
   */
  level: Level | undefined;

  /**
   * The destination for messages this logger receives.
   */
  appender: Appender;

  /**
   * Returns if this logger will output messages at the specified level.
   *
   * @param level - the level to check
   */
  isEnabled(level: Level): boolean;

  /**
   * Creates a [[LoggingEvent]] of fatal priority, returning `true` if the message will be output based on this
   * logger's level.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  fatal(...input: any[]): boolean;

  /**
   * Creates a [[LoggingEvent]] of error priority, returning `true` if the message will be output based on this
   * logger's level.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  error(...input: any[]): boolean;

  /**
   * Creates a [[LoggingEvent]] of warn priority, returning `true` if the message will be output based on this
   * logger's level.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  warn(...input: any[]): boolean;

  /**
   * Creates a [[LoggingEvent]] of info priority, returning `true` if the message will be output based on this
   * logger's level.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  info(...input: any[]): boolean;

  /**
   * Creates a [[LoggingEvent]] of debug priority, returning `true` if the message will be output based on this
   * logger's level.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  debug(...input: any[]): boolean;

  /**
   * Creates a [[LoggingEvent]] of trace priority, returning `true` if the message will be output based on this
   * logger's level.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  trace(...input: any[]): boolean;

  /**
   * Supplied for compatibility with other logging systems.  Specific level varies by implementation.
   *
   * @param input - data describing the logging event
   */
  // tslint:disable-next-line: no-any
  log(...input: any[]): boolean;
}
