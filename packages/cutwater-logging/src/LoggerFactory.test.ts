import { Config } from '@codification/cutwater-core';
import { OutputTracker } from '@codification/cutwater-nullable';

import { Level } from './Level';
import { Logger } from './Logger';
import { LoggerFactory } from './LoggerFactory';

let logger: Logger;
let tracker: OutputTracker;

beforeAll(() => {
  logger = LoggerFactory.createNullable('Foo');
  tracker = logger.trackOutput();
});

beforeEach(() => {
  tracker.clear();
});

describe('LoggerFactory', () => {
  it('returns the proper logger name', () => {
    expect(logger.name).toBe('Foo');
  });

  it('returns logger with level set by environment variables', () => {
    Config.put(LoggerFactory.ENV_LOGGING_LEVEL_PREFIX + 'baz', 'fatal');
    expect(LoggerFactory.createNullable('baz').level).toBe(Level.FATAL);
  });

  it('logs entries in enabled levels', () => {
    logger.level = Level.INFO;
    logger.error('Test entry: %j', { id: 'Foo', data: 7 });
    expect(tracker.data).toHaveLength(1);
    logger.debug('Test entry');
    expect(tracker.data).toHaveLength(1);
  });

  it('properly uses the GLOBAL_LEVEL when no level is speicified', () => {
    logger.level = undefined;
    LoggerFactory.GLOBAL_LEVEL = Level.ALL;
    expect(logger.level).toBe(LoggerFactory.GLOBAL_LEVEL);
  });

  it('properly logs when ALL levels are enabled', () => {
    logger.level = Level.ALL;
    logger.trace('Trace test entry');
    expect(tracker.data).toHaveLength(1);
    logger.fatal('Fatal test entry');
    expect(tracker.data).toHaveLength(2);
  });

  it('properly logs enabled log levels', () => {
    logger.logEnabledLevels();
    expect(tracker.data).toHaveLength(6);
  });

  it('properly disables all logging when level is OFF', () => {
    logger.level = Level.OFF;
    logger.logEnabledLevels();
    expect(tracker.data).toHaveLength(0);
  });
});
