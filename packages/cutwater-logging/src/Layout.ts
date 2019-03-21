import { LoggingEvent } from './LoggingEvent';

/**
 * Provides formattin for [[LoggingEvent]]s.
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface Layout {
  /**
   * Returns the specified `event` as a formatted text.
   *
   * @param event - the event to be formatted into a text value
   */
  format(event: LoggingEvent): string;
}
