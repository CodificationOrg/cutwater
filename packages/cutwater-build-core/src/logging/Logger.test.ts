import * as gulp from 'gulp';

import { initialize, setConfig } from '..';
import { getLogger, Logger } from './Logger';

const logEntries: string[] = [];

beforeAll(() => {
  const writeEntry = (message?: any): void => {
    const value: string = message ? message.toString() : '';
    logEntries.push(value);
  };
  console['log'] = jest.fn(writeEntry);
  initialize(gulp);
});

beforeEach(() => {
  logEntries.length = 0;
  setConfig({ verbose: false });
});

const LOG = getLogger();

describe('Logger class', () => {
  describe('timestamp methods', () => {
    it('can create a timestamp string', () => expect(Logger.timestamp()).toBeTruthy());
    it('can format a time segment smaller than 10', () => expect(Logger.toTimePart(7)).toEqual('07'));
    it('can format a time segment greater than 10', () => expect(Logger.toTimePart(11)).toEqual('11'));
  });

  describe('verbose logging', () => {
    it('correctly disables verbose logging by default', () => {
      expect(LOG.isVerboseEnabled()).toBeFalsy();
      LOG.verbose('test entry');
      expect(logEntries.length).toEqual(0);
    });
    it('correctly handles verbose logging when enabled', () => {
      setConfig({ verbose: true });
      expect(LOG.isVerboseEnabled()).toBeTruthy();
      LOG.verbose('test entry');
      expect(logEntries.length).toEqual(1);
    });
  });

  it('correctly logs and formats warn logging', () => {
    LOG.warn('another iffy entry');
    expect(logEntries.length).toEqual(1);
    expect(logEntries[0].indexOf('Warning -')).not.toEqual(-1);
  });

  it('correctly logs and formats error logging', () => {
    LOG.error('just plain wrong entry');
    expect(logEntries.length).toEqual(1);
    expect(logEntries[0].indexOf('Error -')).not.toEqual(-1);
  });
});
