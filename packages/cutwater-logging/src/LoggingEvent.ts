import { Level } from './Level';
import { Logger } from './Logger';

/**
 * Represents a logging message and all required context.
 * @beta
 */
export class LoggingEvent {
  /**
   * Creates an instance of a [[LoggingEvent]].
   * @param logger - the logger that should output the message
   * @param level - the level associated with the message
   * @param message - the message to be logged
   */
  constructor(public readonly logger: Logger, public readonly level: Level, public readonly message: any) {}
}
