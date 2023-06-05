import { Logger } from './Logger';

const logEntries: string[] = [];

beforeAll(() => {
  const writeEntry = (message?: any): void => {
    const value: string = message ? message.toString() : '';
    logEntries.push(value);
  };
  console['log'] = jest.fn(writeEntry);
});

beforeEach(() => {
  logEntries.length = 0;
});

describe('Logger class', () => {
  const QUIET_LOGGER = Logger.createNull();
  const VERBOSE_LOGGER = Logger.createNull(true);

  describe('timestamp methods', () => {
    it('can create a timestamp string', () => expect(Logger.timestamp()).toBeTruthy());
    it('can format a time segment smaller than 10', () => expect(Logger.toTimePart(7)).toEqual('07'));
    it('can format a time segment greater than 10', () => expect(Logger.toTimePart(11)).toEqual('11'));
  });

  describe('verbose logging', () => {
    it('correctly disables verbose logging by default', () => {
      expect(QUIET_LOGGER.isVerboseEnabled()).toBeFalsy();
      QUIET_LOGGER.verbose('test entry');
      expect(logEntries.length).toEqual(0);
    });
    it('correctly handles verbose logging when enabled', () => {
      expect(VERBOSE_LOGGER.isVerboseEnabled()).toBeTruthy();
      VERBOSE_LOGGER.verbose('test entry');
      expect(logEntries.length).toEqual(1);
    });
  });

  it('correctly logs and formats warn logging', () => {
    QUIET_LOGGER.warn('another iffy entry');
    expect(logEntries.length).toEqual(1);
    expect(logEntries[0].indexOf('Warning -')).not.toEqual(-1);
  });

  it('correctly logs and formats error logging', () => {
    QUIET_LOGGER.error('just plain wrong entry');
    expect(logEntries.length).toEqual(1);
    expect(logEntries[0].indexOf('Error -')).not.toEqual(-1);
  });
});
