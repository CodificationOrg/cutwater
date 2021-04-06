import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import * as crypto from 'crypto';
import { OAuthResponse } from './OAuthResponse';

interface State {
  v: string;
  s: string;
}

export class AuthState {
  private readonly LOG: Logger = LoggerFactory.getLogger();

  public constructor(private readonly providerName: string, private readonly clientSecret: string) {}

  public async validateTokenParams(response: OAuthResponse): Promise<boolean> {
    const stateObj: State = JSON.parse(response.state);
    const expected: string = await this.generateStateHash(stateObj.v);
    const rval = expected === stateObj.s;
    if (!rval) {
      this.LOG.warn(`Invalid state.  Received [${stateObj.s}], expected: `, expected);
    }
    return rval;
  }

  public async generateState(): Promise<string> {
    const value = `${this.providerName}.${await this.generateNonce()}`;
    return JSON.stringify({ v: value, s: await this.generateStateHash(value) });
  }

  private generateNonce(): Promise<string> {
    return new Promise((res, rej) => {
      crypto.randomBytes(48, (err, buffer) => {
        if (err) {
          rej(err);
        } else {
          res(buffer.toString('hex'));
        }
      });
    });
  }

  private async generateStateHash(state: string): Promise<string> {
    return crypto
      .createHmac('sha1', this.clientSecret)
      .update(state)
      .digest('hex');
  }
}
