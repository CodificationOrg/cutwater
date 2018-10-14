/**
 * A `TimeUnit` represents time durations at a given unit of granularity and provides utility methods to convert across units.
 */
export class TimeUnit {
  /**
   * Returns a [[TimeUnit]] representing the specified number of days.
   *
   * @param count - The number of days.
   * @returns {TimeUnit}
   */
  public static days(count: number): TimeUnit {
    return TimeUnit.hours(24 * count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of hours.
   *
   * @param count - The number of hours.
   * @returns {TimeUnit}
   */
  public static hours(count: number): TimeUnit {
    return TimeUnit.minutes(60 * count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of milliseconds.
   *
   * @param count - The number of milliseconds.
   * @returns {TimeUnit}
   */
  public static millis(count: number): TimeUnit {
    return new TimeUnit(count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of minutes.
   *
   * @param count - The number of minutes.
   * @returns {TimeUnit}
   */
  public static minutes(count: number): TimeUnit {
    return TimeUnit.seconds(60 * count);
  }

  /**
   * Returns a [[TimeUnit]] representing the specified number of seconds.
   *
   * @param count - The number of seconds.
   * @returns {TimeUnit}
   */
  public static seconds(count: number): TimeUnit {
    return TimeUnit.millis(1000 * count);
  }

  private milliseconds: number;

  private constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }

  /**
   * Returns the number of milliseconds, rounded to the greatest integer less than or equal to, the [[TimeUnit]] instance.
   *
   * @returns {number}
   */
  public toMillis(): number {
    return this.milliseconds;
  }

  /**
   * Returns the number of seconds, rounded to the greatest integer less than or equal to, the [[TimeUnit]] instance.
   *
   * @returns {number}
   */
  public toSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }

  /**
   * Returns the number of minutes, rounded to the greatest integer less than or equal to, the [[TimeUnit]] instance.
   *
   * @returns {number}
   */
  public toMinutes(): number {
    return Math.floor(this.toSeconds() / 60);
  }

  /**
   * Returns the number of hours, rounded to the greatest integer less than or equal to, the [[TimeUnit]] instance.
   *
   * @returns {number}
   */
  public toHours(): number {
    return Math.floor(this.toMinutes() / 60);
  }

  /**
   * Returns the number of days, rounded to the greatest integer less than or equal to, the [[TimeUnit]] instance.
   *
   * @returns {number}
   */
  public toDays(): number {
    return Math.floor(this.toHours() / 24);
  }
}
