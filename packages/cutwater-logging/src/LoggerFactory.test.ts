import { Config } from '@codification/cutwater-core';
import { Level } from './Level';
import { Logger } from './Logger';
import { LoggerFactory } from './LoggerFactory';

const logEntries: string[] = [];
let oldLog: any;
let logger: Logger;

beforeAll(() => {
  // tslint:disable-next-line: missing-optional-annotation no-any typedef
  const writeEntry = (message?: any, ...optionalParams: any[]): void => {
    const value: string = message ? message.toString() : '';
    logEntries.push(value);
  };
  // tslint:disable-next-line: no-string-literal
  oldLog = console['log'];
  // tslint:disable-next-line: no-string-literal
  console['log'] = jest.fn(writeEntry);
  logger = LoggerFactory.getLogger('Foo');
});

beforeEach(() => {
  logEntries.length = 0;
});

afterAll(() => {
  // tslint:disable-next-line: no-string-literal
  console['log'] = oldLog;
});

describe('LoggerFactory', () => {
  it('returns the proper logger name', () => {
    expect(logger.name).toBe('Foo');
  });

  it('returns logger with level set by environment variables', () => {
    Config.put(LoggerFactory.ENV_LOGGING_LEVEL_PREFIX + 'baz', 'fatal');
    expect(LoggerFactory.getLogger('baz').level).toBe(Level.FATAL);
  });

  it('logs entries in enabled levels', () => {
    logger.level = Level.INFO;
    logger.error('Test entry: %j', { id: 'Foo', data: 7 });
    expect(logEntries.length).toBe(1);
    logger.debug('Test entry');
    expect(logEntries.length).toBe(1);
  });

  it('properly uses the GLOBAL_LEVEL when no level is speicified', () => {
    logger.level = undefined;
    LoggerFactory.GLOBAL_LEVEL = Level.ALL;
    expect(logger.level).toBe(LoggerFactory.GLOBAL_LEVEL);
  });

  it('properly logs when ALL levels are enabled', () => {
    logger.level = Level.ALL;
    logger.trace('Trace test entry');
    expect(logEntries.length).toBe(1);
    logger.fatal('Fatal test entry');
    expect(logEntries.length).toBe(2);
  });

  it('properly logs enabled log levels', () => {
    LoggerFactory.logEnabledLevels(logger);
    expect(logEntries.length).toBe(6);
  });

  it('properly disables all logging when level is OFF', () => {
    logger.level = Level.OFF;
    LoggerFactory.logEnabledLevels(logger);
    expect(logEntries.length).toBe(0);
  });
});
