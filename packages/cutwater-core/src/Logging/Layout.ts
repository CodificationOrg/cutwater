import { LoggingEvent } from './LoggingEvent';

/**
 * Provides formattin for [[LoggingEvent]]s.
 */
export interface Layout {
  /**
   * Returns the specified `event` as a formatted text.
   *
   * @param event - The event to be formatted into a text value.
   */
  format(event: LoggingEvent): string;
}
