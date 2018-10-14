import { Level } from './Level';
import { Logger } from './Logger';

/**
 * Represents a logging message and all required context.
 */
export class LoggingEvent {
  /**
   * Creates an instance of a [[LoggingEvent]].
   * @param logger - The logger that should output the message.
   * @param level - The level associated with the message.
   * @param message - The message to be logged.
   */
  constructor(public readonly logger: Logger, public readonly level: Level, public readonly message: any) {}
}
