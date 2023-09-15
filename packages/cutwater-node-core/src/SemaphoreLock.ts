export type Key = number;

export class SemaphoreLock {
  private key: Key = 0;
  private locked = false;
  private lockedAt = -1;

  public constructor(private readonly maxLockAgeMillis = 5000) {}

  public isLocked(): boolean {
    return this.locked;
  }

  private lockAge(): number {
    return !this.isLocked() || this.maxLockAgeMillis === -1
      ? -1
      : Date.now() - this.lockedAt;
  }

  public isLockExpired(): boolean {
    return !this.isLocked ? false : this.lockAge() > this.maxLockAgeMillis;
  }

  private attemptToLock(): Key | undefined {
    if (!this.isLocked() || this.isLockExpired()) {
      this.locked = true;
      this.lockedAt = Date.now();
      this.key++;
      return this.key;
    }
    return undefined;
  }

  private waitForLock(): Promise<Key> {
    return new Promise<Key>((res) => {
      const timer: NodeJS.Timer = setInterval(() => {
        const rval = this.attemptToLock();
        if (rval) {
          clearInterval(timer);
          res(rval);
        }
      }, 40);
    });
  }

  public async aquire(): Promise<Key> {
    return this.attemptToLock() || this.waitForLock();
  }

  public release(key: Key): boolean {
    if (!this.isLocked()) {
      return true;
    }
    if (key === this.key) this.locked = false;
    return !this.isLocked();
  }
}
