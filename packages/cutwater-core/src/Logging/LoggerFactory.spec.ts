import * as test from 'tape';

import { Appender } from './Appender';
import { Level } from './Level';
import { LoggerFactory } from './LoggerFactory';
import { LoggingEvent } from './LoggingEvent';
import { SimpleLayout } from './SimpleLayout';

test('LoggerFactory Unit Tests', assert => {
  const appender = new MockAppender();
  const logger = LoggerFactory.getLogger('Foo');
  logger.level = Level.INFO;
  logger.appender = appender;

  assert.is(logger.name, 'Foo', 'can create a logger');
  logger.error('Test entry: %j', { id: 'Foo', data: 7 });
  assert.equal(appender.entries.length, 1, 'will log error messages when enabled');
  logger.debug('Test entry');
  assert.equal(appender.entries.length, 1, 'will not log debug messages when disabled');

  logger.level = undefined;
  LoggerFactory.GLOBAL_LEVEL = Level.ALL;
  appender.entries = [];

  assert.equals(logger.level, LoggerFactory.GLOBAL_LEVEL, 'logger will return the GLOBAL_LEVEL when not defined');
  logger.debug('Debug test entry');
  assert.equal(appender.entries.length, 1, 'logger will respect the GLOBAL_LEVEL when not defined specifically');
  logger.trace('Trace test entry');
  assert.equal(appender.entries.length, 2, 'logger will print trace level when enabled');

  appender.entries = [];
  LoggerFactory.logEnabledLevels(logger);
  assert.equal(appender.entries.length, 6, 'can log one message for each enabled logging level.');

  appender.entries = [];
  logger.level = Level.OFF;
  LoggerFactory.logEnabledLevels(logger);
  assert.equal(appender.entries.length, 0, 'logs no messages for enabled logging levels when leve is OFF.');

  assert.end();
});

class MockAppender implements Appender {
  public name = 'mock';
  public layout = new SimpleLayout();
  public entries: string[] = [];

  public doAppend(event: LoggingEvent): void {
    this.entries.push(this.layout.format(event));
  }
}
