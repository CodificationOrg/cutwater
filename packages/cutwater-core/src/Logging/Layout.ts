import { LoggingEvent } from './LoggingEvent';

export interface Layout {
  format(event: LoggingEvent): string;
}
