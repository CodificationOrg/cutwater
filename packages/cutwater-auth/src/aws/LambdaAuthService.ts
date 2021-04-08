import { TimeUnit } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { AuthService } from '../AuthService';
import { LambdaAuthOptions } from './LambdaAuthOptions';

export class LambdaAuthService implements AuthService<APIGatewayProxyEvent, APIGatewayProxyResult>{
  private readonly LOG: Logger = LoggerFactory.getLogger();
  private readonly SET_COOKIE: string = 'Set-Cookie';
  private readonly DEFAULT_OPTS: LambdaAuthOptions = {
    tokenCookie: 'idToken',
    tokenTTLSeconds: TimeUnit.minutes(30).toSeconds()
  }

  private readonly opts: LambdaAuthOptions;

  public constructor(private readonly tokenSecret: string, opts?: Partial<LambdaAuthOptions>) {
    this.opts = { ...this.DEFAULT_OPTS, ...opts };
  }

  public getUserId(req: APIGatewayProxyEvent): Promise<string | undefined> {
    const token: string | undefined = this.getCookieValue(req);
    if (!token) {
      return Promise.resolve(undefined);
    }
    try {
      const payload: any = jwt.verify(token, this.tokenSecret);
      return Promise.resolve(!!payload && !!payload.userId ? payload.userId : undefined);
    } catch (err) {
      throw new Error(`Received invalid token: ${err.message}`);
    }
  }

  public async setUserId(res: APIGatewayProxyResult, userId?: string): Promise<void> {
    this.addTokenHeaders(res, this.generateIdTokenCookieValue(userId));
    return Promise.resolve();
  }

  private generateIdTokenCookieValue(userId?: string): string {
    const expires: Date | undefined = !!userId ? new Date(Date.now() + (this.opts.tokenTTLSeconds * 1000)) : new Date(0);
    return cookie.serialize(this.opts.tokenCookie, this.createTokenValue(userId), { httpOnly: true, secure: true, sameSite: 'lax', expires });
  }

  private createTokenValue(userId?: string): string {
    if (userId) {
      this.LOG.debug(`Creating token for userId: `, userId);
    }
    return !userId ? '' : jwt.sign({ userId }, this.tokenSecret, { expiresIn: this.opts.tokenTTLSeconds });
  }

  private addTokenHeaders(res: APIGatewayProxyResult, token: string): APIGatewayProxyResult {
    const headers = res.headers || {};
    if (headers[this.SET_COOKIE]) {
      const current: string | number | boolean = headers[this.SET_COOKIE];
      delete headers[this.SET_COOKIE];
      const multiHeaders = res.multiValueHeaders || {};
      multiHeaders[this.SET_COOKIE] = [current, token];
      res.multiValueHeaders = multiHeaders;
    } else {
      headers[this.SET_COOKIE] = token;
      res.headers = headers;
    }
    return res;
  }

  private getCookieValue(event: APIGatewayProxyEvent): string | undefined {
    let rval: string | undefined;
    if (!!event.headers && !!event.headers.cookie) {
      rval = cookie.parse(event.headers.cookie)[this.opts.tokenCookie];
    }
    return rval;
  }
}