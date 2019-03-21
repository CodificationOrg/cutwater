import { TZUtils } from '@codification/cutwater-core';

import { Layout } from './Layout';
import { LoggerFactory } from './LoggerFactory';
import { LoggingEvent } from './LoggingEvent';

/**
 * Specifies a simple, default layout for logging messages of the following form:
 *
 * ```
 * TIMESTAMP - LOGGER_NAME - LEVEL - MESSAGE
 * ```
 */
export class SimpleLayout implements Layout {
  /**
   * The format to be used for timestamps in this layout.
   */
  public timestampFormat: string = 'YYYY-MM-DD HH:mm:ss,SSS';

  public format(event: LoggingEvent): string {
    const loggerName: string =
      event.logger.name && event.logger.name !== LoggerFactory.DEFAULT_LOGGER
        ? `${event.logger.name} - `
        : '';
    return `${TZUtils.timestamp(this.timestampFormat)} -${loggerName}${
      event.level.name
    } - ${event.message}`;
  }
}
