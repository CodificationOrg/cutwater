import { Appender } from './Appender';
import { Layout } from './Layout';
import { LoggingEvent } from './LoggingEvent';
import { SimpleLayout } from './SimpleLayout';

// tslint:disable:no-console
export class ConsoleAppender implements Appender {
  public readonly name: string;
  public readonly layout: Layout;

  constructor(name: string = 'console', layout: Layout = new SimpleLayout()) {
    this.name = name;
    this.layout = layout;
  }

  public doAppend(event: LoggingEvent): void {
    console.log(this.layout.format(event));
  }
}
