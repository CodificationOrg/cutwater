import { Layout } from './Layout';
import { LoggingEvent } from './LoggingEvent';

/**
 * A destination for [[LoggingEvent]]s.
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface Appender {
  /**
   * The name of this appender.
   */
  name: string;

  /**
   * The [[Layout]] used by this appender to format [[LoggingEvent]]s.
   */
  layout: Layout;

  /**
   * Append the specified [[LoggingEvent]] using the configured [[Layout]].
   *
   * @param event - the event to be appended
   */
  doAppend(event: LoggingEvent): void;
}
