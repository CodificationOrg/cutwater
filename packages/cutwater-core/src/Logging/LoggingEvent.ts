import { Level } from './Level';
import { Logger } from './Logger';

export class LoggingEvent {
  constructor(public readonly logger: Logger, public readonly level: Level, public readonly message: any) {}
}
