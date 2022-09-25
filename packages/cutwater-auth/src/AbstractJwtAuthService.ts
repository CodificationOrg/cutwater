import { TimeUnit } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { AuthService } from './AuthService';
import { JwtAuthOptions } from './JWTAuthOptions';

export type JwtSecret = string | (() => Promise<string>);

export abstract class AbstractJwtAuthService<T, E> implements AuthService<T, E> {
  protected readonly LOG: Logger = LoggerFactory.getLogger();
  protected readonly DEFAULT_OPTS: JwtAuthOptions = {
    tokenCookie: 'idToken',
    tokenTTLSeconds: TimeUnit.minutes(30).toSeconds(),
  };

  protected readonly opts: JwtAuthOptions;
  private resolvedSecret: string;

  public constructor(private readonly secret: JwtSecret, opts?: Partial<JwtAuthOptions>) {
    this.opts = { ...this.DEFAULT_OPTS, ...opts };
  }

  public async getUserId(req: T): Promise<string | undefined> {
    const token: string | undefined = this.getCookieValue(req);
    if (!token) {
      return undefined;
    }
    try {
      const payload: any = jwt.verify(token, await this.getTokenSecret());
      return !!payload && !!payload.userId ? payload.userId : undefined;
    } catch (err) {
      throw new Error(`Received invalid token: ${err.message}`);
    }
  }

  public async setUserId(res?: E, userId?: string): Promise<void> {
    if (res) {
      this.addTokenHeaders(res, await this.generateIdTokenCookieValue(userId));
    }
  }

  private async generateIdTokenCookieValue(userId?: string): Promise<string> {
    const expires: Date | undefined = !!userId ? new Date(Date.now() + this.opts.tokenTTLSeconds * 1000) : new Date(0);
    return cookie.serialize(this.opts.tokenCookie, await this.createTokenValue(userId), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires,
    });
  }

  private async createTokenValue(userId?: string): Promise<string> {
    if (userId) {
      this.LOG.debug(`Creating token for userId: `, userId);
    }
    return !userId ? '' : jwt.sign({ userId }, await this.getTokenSecret(), { expiresIn: this.opts.tokenTTLSeconds });
  }

  private async getTokenSecret(): Promise<string> {
    if (!this.resolvedSecret) {
      this.resolvedSecret = typeof this.secret === 'string' ? this.secret : await this.secret();
    }
    return this.resolvedSecret;
  }

  protected abstract addTokenHeaders(res: E, token: string): E;

  protected abstract getCookieValue(req: T): string | undefined;
}
