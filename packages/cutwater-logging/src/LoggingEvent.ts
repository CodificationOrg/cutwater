import { Level } from './Level';
import { Logger } from './Logger';

/**
 * Represents a logging message and all required context.
 */
export class LoggingEvent {
  /**
   * Creates an instance of a [[LoggingEvent]].
   * @param logger - the logger that should output the message
   * @param level - the level associated with the message
   * @param message - the message to be logged
   */
  // tslint:disable-next-line: no-any
  constructor(
    public readonly logger: Logger,
    public readonly level: Level,
    // tslint:disable-next-line: no-any
    public readonly message: any
  ) {}
}
