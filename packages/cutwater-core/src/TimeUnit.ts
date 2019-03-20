/**
 * A `TimeUnit` represents time durations at a given unit of granularity and provides utility methods to convert
 * across units.
 * @beta
 */
export class TimeUnit {
  private milliseconds: number;

  /**
   * Returns a [[TimeUnit]] representing the specified number of days.
   *
   * @param count - the number of days
   * @returns a Timeunit representing the number of days
   */
  public static days(count: number): TimeUnit {
    return TimeUnit.hours(24 * count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of hours.
   *
   * @param count - the number of hours
   * @returns a Timeunit representing the number of hours
   */
  public static hours(count: number): TimeUnit {
    return TimeUnit.minutes(60 * count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of milliseconds.
   *
   * @param count - the number of milliseconds
   * @returns a Timeunit representing the number of milliseconds
   */
  public static millis(count: number): TimeUnit {
    return new TimeUnit(count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of minutes.
   *
   * @param count - the number of minutes
   * @returns a Timeunit representing the number of minutes
   */
  public static minutes(count: number): TimeUnit {
    return TimeUnit.seconds(60 * count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of seconds.
   *
   * @param count - the number of seconds
   * @returns a Timeunit representing the number of seconds
   */
  public static seconds(count: number): TimeUnit {
    return TimeUnit.millis(1000 * count);
  }

  /**
   * Returns the number of milliseconds, rounded to the greatest integer less than or equal to, the [[TimeUnit]]
   * instance.
   *
   * @returns the number of milliseconds
   */
  public toMillis(): number {
    return this.milliseconds;
  }

  /**
   * Returns the number of seconds, rounded to the greatest integer less than or equal to, the [[TimeUnit]]
   * instance.
   *
   * @returns the number of seconds
   */
  public toSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }

  /**
   * Returns the number of minutes, rounded to the greatest integer less than or equal to, the [[TimeUnit]]
   * instance.
   *
   * @returns the number of minutes
   */
  public toMinutes(): number {
    return Math.floor(this.toSeconds() / 60);
  }

  /**
   * Returns the number of hours, rounded to the greatest integer less than or equal to, the [[TimeUnit]]
   * instance.
   *
   * @returns the number of hours
   */
  public toHours(): number {
    return Math.floor(this.toMinutes() / 60);
  }

  /**
   * Returns the number of days, rounded to the greatest integer less than or equal to, the [[TimeUnit]]
   * instance.
   *
   * @returns the number of days
   */
  public toDays(): number {
    return Math.floor(this.toHours() / 24);
  }

  private constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }

}
