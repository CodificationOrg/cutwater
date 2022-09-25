import cookie from 'cookie';
import { Request, Response } from 'express';
import { OutgoingHttpHeader } from 'http';
import { AbstractJwtAuthService } from '../AbstractJwtAuthService';

export class ExpressAuthService extends AbstractJwtAuthService<Request, Response> {
  private readonly SET_COOKIE: string = 'Set-Cookie';

  protected addTokenHeaders(res: Response, token: string): Response {
    res.cookie(this.opts.tokenCookie,)

    const headers = res.getHeaders();
    if (headers[this.SET_COOKIE]) {
      const current: OutgoingHttpHeader | undefined = headers[this.SET_COOKIE];
      
      delete headers[this.SET_COOKIE];
      const multiHeaders = res.multiValueHeaders || {};
      multiHeaders[this.SET_COOKIE] = [current, token];
      res.multiValueHeaders = multiHeaders;
    } else {
      res.setHeader(this.SET_COOKIE, token);
    }
    return res;
  }

  protected getCookieValue(req: Request): string | undefined {
    return req.cookies
    let rval: string | undefined;
    if (!!event.headers && !!event.headers.cookie) {
      rval = cookie.parse(event.headers.cookie)[this.opts.tokenCookie];
    }
    return rval;
  }
}
