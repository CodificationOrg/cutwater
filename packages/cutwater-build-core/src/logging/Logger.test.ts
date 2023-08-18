import { Logger } from './Logger';

describe('Logger', () => {
  describe('timestamp', () => {
    it('can create a timestamp string', () => expect(Logger.timestamp()).toBeTruthy());
  });

  describe('toTimePart', () => {
    it('can format a time segment smaller than 10', () => expect(Logger.toTimePart(7)).toEqual('07'));
    it('can format a time segment greater than 10', () => expect(Logger.toTimePart(11)).toEqual('11'));
  });

  describe('verbose', () => {
    it('correctly disables verbose logging by default', () => {
      const log = Logger.createNull();
      const tracker = log.trackOutput();
      expect(log.isVerboseEnabled()).toBeFalsy();
      log.verbose('test entry');
      expect(tracker.clear().length).toEqual(0);
    });
    it('correctly handles verbose logging when enabled', () => {
      const log = Logger.createNull(true);
      const tracker = log.trackOutput();
      expect(log.isVerboseEnabled()).toBeTruthy();
      log.verbose('test entry');
      expect(tracker.clear().length).toEqual(1);
    });
  });

  describe('warn', () => {
    it('correctly logs and formats warn logging', () => {
      const log = Logger.createNull();
      const tracker = log.trackOutput();
      log.warn('another iffy entry');
      expect(tracker.data.length).toEqual(1);
      expect(tracker.clear()[0].indexOf('Warning -')).not.toEqual(-1);
    });
  });

  describe('error', () => {
    it('correctly logs and formats error logging', () => {
      const log = Logger.createNull();
      const tracker = log.trackOutput();
      log.error('just plain wrong entry');
      expect(tracker.data.length).toEqual(1);
      expect(tracker.clear()[0].indexOf('Error -')).not.toEqual(-1);
    });
  });
});
