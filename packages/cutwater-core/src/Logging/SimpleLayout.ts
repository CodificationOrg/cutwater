import { TZUtils } from '../Time/TZUtils';
import { Layout } from './Layout';
import { LoggerFactory } from './LoggerFactory';
import { LoggingEvent } from './LoggingEvent';

export class SimpleLayout implements Layout {
  public timestampFormat = 'YYYY-MM-DD HH:mm:ss,SSS';

  public format(event: LoggingEvent): string {
    const loggerName = event.logger.name && event.logger.name !== LoggerFactory.DEFAULT_LOGGER ? `${event.logger.name} - ` : '';
    return `${TZUtils.timestamp(this.timestampFormat)} -${loggerName}${event.level.name} - ${event.message}`;
  }
}
