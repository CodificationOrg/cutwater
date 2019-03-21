import { Appender } from './Appender';
import { Layout } from './Layout';
import { Level } from './Level';
import { Logger } from './Logger';
import { LoggerFactory } from './LoggerFactory';
import { LoggingEvent } from './LoggingEvent';
import { SimpleLayout } from './SimpleLayout';

class MockAppender implements Appender {
  public name: string = 'mock';
  public layout: Layout = new SimpleLayout();
  public entries: string[] = [];

  public doAppend(event: LoggingEvent): void {
    this.entries.push(this.layout.format(event));
  }
}

test('LoggerFactory Unit Tests', () => {
  const appender: MockAppender = new MockAppender();
  const logger: Logger = LoggerFactory.getLogger('Foo');

  logger.level = Level.INFO;
  logger.appender = appender;

  expect(logger.name).toBe('Foo');

  logger.error('Test entry: %j', { id: 'Foo', data: 7 });
  expect(appender.entries.length).toBe(1);

  logger.debug('Test entry');
  expect(appender.entries.length).toBe(1);

  logger.level = undefined;
  LoggerFactory.GLOBAL_LEVEL = Level.ALL;
  appender.entries = [];
  expect(logger.level).toBe(LoggerFactory.GLOBAL_LEVEL);

  logger.debug('Debug test entry');
  expect(appender.entries.length).toBe(1);

  logger.trace('Trace test entry');
  expect(appender.entries.length).toBe(2);

  appender.entries = [];
  LoggerFactory.logEnabledLevels(logger);
  expect(appender.entries.length).toBe(6);

  appender.entries = [];
  logger.level = Level.OFF;
  LoggerFactory.logEnabledLevels(logger);
  expect(appender.entries.length).toBe(0);
});
