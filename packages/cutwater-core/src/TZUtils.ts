import * as fmt from 'date-fns/format';

import { Config } from './Config';
import { TimeUnit } from './TimeUnit';

/**
 * A simple utility for handling timezones.
 * @beta
 */
export class TZUtils {
  /**
   * Name of value read from [[Config]] to determine initial timezone if present.
   *
   * @readonly
   */
  public static readonly ENV_OFFSET: string = 'UTC_OFFSET';

  /**
   * The default timezone offset if `UTC_OFFSET` is not set in [[Config]].
   *
   * @readonly
   */
  public static readonly DEFAULT_OFFSET: number = 0;

  /**
   * The default format used when calling [[TZUtils.timestamp]].
   *
   * @readonly
   */
  public static readonly FORMAT_TIMESTAMP: string = 'YYYY-MM-DD HH:mm:ss,SSS';

  /**
   * Resets the [[TZUtils.timezoneOffset]] to [[TZUtils.DEFAULT_OFFSET]].
   */
  public static resetTimezoneOffset(): void {
    TZUtils.timezoneOffset = TZUtils.DEFAULT_OFFSET;
  }

  /**
   * The current offset in minutes from UTC. May be positive or negative.
   */
  public static set timezoneOffset(minutes: number) {
    Config.put(
      this.ENV_OFFSET,
      (minutes ? minutes : TZUtils.DEFAULT_OFFSET).toString()
    );
  }

  public static get timezoneOffset(): number {
    return +Config.get(TZUtils.ENV_OFFSET, TZUtils.DEFAULT_OFFSET.toString());
  }

  /**
   * Returns the current timestamp as a string. The actual value depends on both the [[TZUtils.timezoneOffset]] and the
   * optionally provided format.
   *
   *  * Please see the [date-fns project](https://date-fns.org/v1.29.0/docs/format) for details about the valid values
   * for the format string.
   *
   * @param format - the optional [date-fns style](https://date-fns.org/v1.29.0/docs/format) format for the output
   * @returns a string timestamp reflecting the current timezone offset
   */
  public static timestamp(format: string = this.FORMAT_TIMESTAMP): string {
    return fmt(TZUtils.now, format);
  }

  /**
   * A `Date` object representing the date/time at the current [[TZUtils.timezoneOffset]].
   *
   * @readonly
   */
  public static get now(): Date {
    const rval: Date = new Date();
    return new Date(
      rval.getTime() +
        TimeUnit.minutes(rval.getTimezoneOffset()).toMillis() +
        TimeUnit.minutes(TZUtils.timezoneOffset).toMillis()
    );
  }
}
