export class TimeUnit {
  public static days(count: number): TimeUnit {
    return TimeUnit.hours(24 * count);
  }

  public static hours(count: number): TimeUnit {
    return TimeUnit.minutes(60 * count);
  }

  public static millis(count: number): TimeUnit {
    return new TimeUnit(count);
  }

  public static minutes(count: number): TimeUnit {
    return TimeUnit.seconds(60 * count);
  }

  public static seconds(count: number): TimeUnit {
    return TimeUnit.millis(1000 * count);
  }

  private milliseconds: number;

  private constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }

  public toMillis(): number {
    return this.milliseconds;
  }

  public toSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }

  public toMinutes(): number {
    return Math.floor(this.toSeconds() / 60);
  }

  public toHours(): number {
    return Math.floor(this.toMinutes() / 60);
  }

  public toDays(): number {
    return Math.floor(this.toHours() / 24);
  }
}
