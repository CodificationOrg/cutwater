import { AsyncUtils } from '@codification/cutwater-core';
import { SemaphoreLock } from './SemaphoreLock';

let lock: SemaphoreLock;
beforeEach(() => {
  lock = new SemaphoreLock();
});

describe('SemaphoreLock', () => {
  describe('isLocked', () => {
    it('returns true when locked', async () => {
      const result = await lock.aquire();
      expect(lock.isLocked()).toBeTruthy();
      expect(lock.release(result)).toBeTruthy();
    });
    it('returns false when not locked', async () => {
      expect(lock.isLocked()).toBeFalsy();
    });
  });

  describe('isLockedExpired', () => {
    it('returns false when unlocked', async () => {
      expect(lock.isLocked()).toBeFalsy();
      expect(lock.isLockExpired()).toBeFalsy();
    });
    it('returns false when not expired', async () => {
      const result = await lock.aquire();
      expect(lock.isLocked()).toBeTruthy();
      expect(lock.isLockExpired()).toBeFalsy();
      lock.release(result);
    });
    it('returns true when expired', async () => {
      const shortLock = new SemaphoreLock(5);
      const result = await shortLock.aquire();
      expect(shortLock.isLocked()).toBeTruthy();
      await AsyncUtils.wait(6);
      expect(shortLock.isLockExpired()).toBeTruthy();
      shortLock.release(result);
    });
  });

  describe('aquire', () => {
    it('returns a key when not already locked', async () => {
      expect(lock.isLocked()).toBeFalsy();
      const result = await lock.aquire();
      expect(lock.isLocked()).toBeTruthy();
      expect(lock.release(result)).toBeTruthy();
    });
    it('returns a key after lock expires', async () => {
      const shortLock = new SemaphoreLock(5);
      let result = await shortLock.aquire();
      await AsyncUtils.wait(6);
      expect(shortLock.isLockExpired()).toBeTruthy();
      result = await shortLock.aquire();
      expect(shortLock.isLocked()).toBeTruthy();
      expect(shortLock.release(result)).toBeTruthy();
    });
  });
});
