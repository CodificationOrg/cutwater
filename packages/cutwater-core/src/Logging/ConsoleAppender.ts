import { Appender } from './Appender';
import { Layout } from './Layout';
import { LoggingEvent } from './LoggingEvent';
import { SimpleLayout } from './SimpleLayout';

// tslint:disable:no-console
/**
 * The default [[Appender]] implementation that writes all [[LoggingEvent]]s to `console.log()`.
 */
export class ConsoleAppender implements Appender {
  /**
   * @readonly
   */
  public readonly name: string;

  /**
   * @readonly
   */
  public readonly layout: Layout;

  /**
   * Creates a new `console` based [[Appender]].
   *
   * @param name - The name of this appender.
   * @param layout - The layout to use for received logging events.
   */
  constructor(name: string = 'console', layout: Layout = new SimpleLayout()) {
    this.name = name;
    this.layout = layout;
  }

  public doAppend(event: LoggingEvent): void {
    console.log(this.layout.format(event));
  }
}
