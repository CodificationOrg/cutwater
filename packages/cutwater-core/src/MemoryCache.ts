import { TimeUnit } from './TimeUnit';

interface CacheEntry {
  val: unknown;
  exp: number;
}

export class MemoryCache {
  private readonly CACHE: Record<string, CacheEntry> = {};
  private readonly DEFAULT_TTL: number;

  private nextExpiration: number;

  public constructor(defaultTTLSedonds = 90) {
    if (defaultTTLSedonds < 1) {
      throw new Error('Minimum cache TTL is 1 second.');
    }
    this.DEFAULT_TTL = defaultTTLSedonds;
    this.resetNextExpiration();
  }

  public keys(): string[] {
    this.sweep();
    return Object.keys(this.CACHE);
  }

  public clear(): void {
    Object.keys(this.CACHE).forEach(key => delete this.CACHE[key]);
  }

  public size(): number {
    return this.keys().length;
  }

  public containsKey(key: string): boolean {
    return this.get(key) !== undefined;
  }

  public put<T>(key: string, value: T, ttlSeconds: number = this.DEFAULT_TTL): T | undefined {
    const rval: T | undefined = this.get(key);
    const entry: CacheEntry = {
      val: value,
      exp: Date.now() + TimeUnit.seconds(ttlSeconds).toMillis(),
    };
    this.CACHE[key] = entry;
    this.updateNextExpiration(entry);
    return rval;
  }

  public get<T>(key: string): T | undefined {
    this.sweep();
    const entry = this.CACHE[key];
    if (entry && !this.isExpired(entry)) {
      return entry.val as T;
    } else if (entry) {
      delete this.CACHE[key];
    }
    return undefined;
  }

  public remove<T>(key: string): T | undefined {
    const value = this.get<T>(key);
    if (value) {
      delete this.CACHE[key];
    }
    return value;
  }

  private resetNextExpiration(): void {
    this.nextExpiration = Date.now() + TimeUnit.seconds(this.DEFAULT_TTL).toMillis();
  }

  private isExpired(entry?: CacheEntry): boolean {
    return !!entry && Date.now() > entry.exp;
  }

  private updateNextExpiration(entry?: CacheEntry): void {
    if (!!entry && !this.isExpired(entry)) {
      if (entry.exp < this.nextExpiration) {
        this.nextExpiration = entry.exp;
      }
    }
  }

  private sweep(): void {
    if (Date.now() >= this.nextExpiration) {
      this.resetNextExpiration();
      this.keys().forEach(key => {
        const entry = this.CACHE[key];
        if (this.isExpired(entry)) {
          delete this.CACHE[key];
        } else {
          this.updateNextExpiration(entry);
        }
      });
    }
  }
}
