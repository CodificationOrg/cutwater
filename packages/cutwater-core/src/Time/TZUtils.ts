import * as fmt from 'date-fns/format';

import { Config } from '../Config';
import { TimeUnit } from './TimeUnit';

export class TZUtils {
  public static readonly ENV_OFFSET = 'UTC_OFFSET';

  public static readonly DEFAULT_OFFSET = TimeUnit.hours(-5).toMinutes();

  public static readonly FORMAT_TIMESTAMP = 'YYYY-MM-DD HH:mm:ss,SSS';

  public static set timezoneOffset(minutes: number) {
    Config.put(this.ENV_OFFSET, (minutes ? minutes : TZUtils.DEFAULT_OFFSET).toString());
  }

  public static get timezoneOffset(): number {
    return +Config.get(TZUtils.ENV_OFFSET, TZUtils.DEFAULT_OFFSET.toString());
  }

  public static timestamp(format: string = this.FORMAT_TIMESTAMP): string {
    return fmt(new Date(TZUtils.now), format);
  }

  public static get now(): number {
    const rval = new Date();
    return (
      rval.getTime() +
      TimeUnit.minutes(rval.getTimezoneOffset()).toMillis() +
      TimeUnit.minutes(TZUtils.timezoneOffset).toMillis()
    );
  }
}
