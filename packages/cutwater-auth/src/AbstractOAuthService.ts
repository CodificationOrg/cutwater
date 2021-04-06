import { LoggerFactory } from '@codification/cutwater-logging';
import FormData from 'form-data';
import * as jwt from 'jsonwebtoken';
import { GetPublicKeyOrSecret, JwtHeader } from 'jsonwebtoken';
import jwks from 'jwks-rsa';
import { AuthState } from './AuthState';
import { OAuthResponse } from './OAuthResponse';
import { OAuthService } from './OAuthService';
import { OAuthClaims } from './OAuthClaims';
import { HttpService } from '@codification/cutwater-node-core';

interface Tokens {
  idToken: string;
  accessToken: string;
}

interface TokenRequestConfig {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: string;
}

export abstract class AbstractOAuthService implements OAuthService {
  protected readonly LOG = LoggerFactory.getLogger();
  protected readonly AUTH_STATE;

  private readonly AUTHORIZATION_ENDPOINT = 'authorization_endpoint';
  private readonly TOKEN_ENDPOINT = 'token_endpoint';
  private readonly KEY_ENDPOINT = 'jwks_uri';
  private readonly ID_TOKEN = 'id_token';
  private readonly ACCESS_TOKEN = 'access_token';

  private readonly discoveryUrl: string;
  private readonly httpService: HttpService = new HttpService();

  private jwksClient: any;
  private discoveryDocument: any;
  private jwtVerificationFunction: GetPublicKeyOrSecret;

  public constructor(
    public readonly name: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly scope: string[],
    discoveryUrlBase: string,
  ) {
    this.AUTH_STATE = new AuthState(name, clientSecret);
    this.discoveryUrl = `${discoveryUrlBase}/.well-known/openid-configuration`;
  }

  public async generateAuthUrl(redirectUrl: string): Promise<string> {
    const rval =
      `${await this.getAuthorizationEndpoint()}?response_type=code&` +
      `client_id=${await this.clientId}&` +
      `scope=${encodeURIComponent(this.scope!.join(' '))}&` +
      `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
      `state=${encodeURIComponent(await this.AUTH_STATE.generateState(this.name))}`;
    this.LOG.debug(`Generated auth url[${this.name}]: `, rval);

    return rval;
  }

  public async getClaims(response: OAuthResponse): Promise<OAuthClaims> {
    if (await this.AUTH_STATE.validateTokenParams(response)) {
      return await this.fetchClaims(await this.generateTokenRequestConfig(response));
    } else {
      throw new Error('Invalid login input.');
    }
  }

  protected getAuthorizationEndpoint(): Promise<string> {
    return this.getDiscoveryDocumentValue(this.AUTHORIZATION_ENDPOINT);
  }

  protected async fetchClaims(req: TokenRequestConfig): Promise<OAuthClaims> {
    const tokens: Tokens = await this.getTokens(req);
    const verifyFunc = await this.verificationFunction;
    return new Promise((resolve, reject) => {
      jwt.verify(tokens.idToken, verifyFunc, (err, decoded) => {
        if (!!err) {
          reject(err);
        } else {
          const rval: OAuthClaims = decoded! as OAuthClaims;
          this.LOG.debug('Claims received: ', decoded);
          resolve(rval);
        }
      });
    });
  }

  private async getTokens(req: TokenRequestConfig): Promise<Tokens> {
    const body = new FormData();
    Object.keys(req).forEach(field => body.append(field, req[field]));
    const resp = await this.httpService.postForObject<any>(await this.tokenEndpoint, body);
    if (!!resp) {
      const rval: Tokens = {
        idToken: resp.object[this.ID_TOKEN],
        accessToken: resp.object[this.ACCESS_TOKEN],
      };
      return rval;
    } else {
      throw new Error('Did not receive response to token id request.');
    }
  }

  private get tokenEndpoint(): Promise<string> {
    return this.getDiscoveryDocumentValue(this.TOKEN_ENDPOINT);
  }

  public get verificationFunction(): Promise<GetPublicKeyOrSecret> {
    if (!!this.jwtVerificationFunction) {
      return Promise.resolve(this.jwtVerificationFunction);
    }
    return this.getDiscoveryDocumentValue(this.KEY_ENDPOINT).then(uri => {
      this.jwksClient = jwks({ jwksUri: uri });
      this.LOG.info('JWKS client created.');
      this.jwtVerificationFunction = (header: JwtHeader, callback) => {
        this.jwksClient.getSigningKey(header.kid || '', (err: any, key: any) => {
          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
        });
      };
      return this.jwtVerificationFunction;
    });
  }

  private async getDiscoveryDocumentValue(key: string): Promise<string> {
    if (!this.discoveryDocument) {
      const data = await this.httpService.fetchObject(this.discoveryUrl);
      if (!!data) {
        this.discoveryDocument = data.object;
        this.LOG.info('Discovery document successfully loaded.');
      } else if (!data) {
        throw new Error(`Discovery document was not found!`);
      } else {
        throw new Error(`Error getting discovery document: ${JSON.stringify(data)}`);
      }
    }
    return this.discoveryDocument[key];
  }

  private async generateTokenRequestConfig(resposne: OAuthResponse): Promise<TokenRequestConfig> {
    return {
      code: resposne.code,
      client_id: await this.clientId,
      client_secret: await this.clientSecret,
      redirect_uri: resposne.redirectUrl,
      grant_type: 'authorization_code',
    };
  }
}
