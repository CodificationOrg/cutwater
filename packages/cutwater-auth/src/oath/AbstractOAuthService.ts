import { LoggerFactory } from '@codification/cutwater-logging';
import { HttpClient } from '@codification/cutwater-node-core';
import * as jwt from 'jsonwebtoken';
import { GetPublicKeyOrSecret, JwtHeader } from 'jsonwebtoken';
import * as jwks from 'jwks-rsa';
import { OAuthServiceProvider } from '.';
import { AuthState } from './AuthState';
import { OAuthClaims } from './OAuthClaims';
import { OAuthResponse } from './OAuthResponse';
import { OAuthService } from './OAuthService';

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

interface TokenResponse {
  access_token: string;
  id_token: string;
}

export abstract class AbstractOAuthService implements OAuthService {
  protected readonly LOG = LoggerFactory.getLogger();
  protected readonly AUTH_STATE;

  private readonly AUTHORIZATION_ENDPOINT = 'authorization_endpoint';
  private readonly TOKEN_ENDPOINT = 'token_endpoint';
  private readonly KEY_ENDPOINT = 'jwks_uri';

  private readonly discoveryUrl: string;
  private readonly httpClient: HttpClient;

  private jwksClient?: jwks.JwksClient;
  private discoveryDocument?: Record<string, string>;
  private jwtVerificationFunction?: GetPublicKeyOrSecret;

  public constructor(
    httpClient = HttpClient.create(),
    public readonly provider: OAuthServiceProvider,
    private readonly clientId: string,
    private readonly clientSecret: string,
    discoveryUrlBase: string,
    private readonly scope: string[] = ['openid', 'profile', 'email']
  ) {
    this.httpClient = httpClient;
    this.AUTH_STATE = new AuthState(provider, clientSecret);
    this.discoveryUrl = `${discoveryUrlBase}/.well-known/openid-configuration`;
  }

  public async generateAuthUrl(
    redirectUrl: string,
    scope?: string[]
  ): Promise<string> {
    const rval =
      `${await this.getAuthorizationEndpoint()}?response_type=code&` +
      `client_id=${await this.clientId}&` +
      `scope=${encodeURIComponent((scope || this.scope).join(' '))}&` +
      `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
      `state=${encodeURIComponent(await this.AUTH_STATE.generateState())}`;
    this.LOG.debug(
      `[${this.provider}] Generated auth url[${this.provider}]: `,
      rval
    );

    return rval;
  }

  public async getClaims(response: OAuthResponse): Promise<OAuthClaims> {
    if (await this.AUTH_STATE.validateTokenParams(response)) {
      return await this.fetchClaims(this.generateTokenRequestConfig(response));
    } else {
      throw new Error(`[${this.provider}] Invalid response.`);
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
        if (err && !decoded) {
          reject(err);
        } else {
          const rval: OAuthClaims = decoded as OAuthClaims;
          this.LOG.debug(`[${this.provider}] Claims received: `, decoded);
          resolve(rval);
        }
      });
    });
  }

  private async getTokens(req: TokenRequestConfig): Promise<Tokens> {
    const resp = await this.httpClient.postForObject<TokenResponse>(
      await this.tokenEndpoint,
      req
    );
    if (resp) {
      const rval: Tokens = {
        idToken: resp.object.id_token,
        accessToken: resp.object.access_token,
      };
      return rval;
    } else {
      throw new Error(
        `[${this.provider}] Did not receive response to token id request.`
      );
    }
  }

  private get tokenEndpoint(): Promise<string> {
    return this.getDiscoveryDocumentValue(this.TOKEN_ENDPOINT);
  }

  public get verificationFunction(): Promise<GetPublicKeyOrSecret> {
    if (this.jwtVerificationFunction) {
      return Promise.resolve(this.jwtVerificationFunction);
    }
    return this.getDiscoveryDocumentValue(this.KEY_ENDPOINT).then((uri) => {
      if (!this.jwksClient) {
        this.jwksClient = jwks({ jwksUri: uri });
        this.LOG.info(`[${this.provider}] JWKS client created.`);
      }
      const client = this.jwksClient;

      this.jwtVerificationFunction = (header: JwtHeader, callback) => {
        client.getSigningKey(header.kid || '', (err, key) => {
          if (key) {
            callback(null, key.getPublicKey());
          } else {
            callback(err);
          }
        });
      };
      return this.jwtVerificationFunction;
    });
  }

  private async getDiscoveryDocumentValue(key: string): Promise<string> {
    if (!this.discoveryDocument) {
      const data = await this.httpClient.fetchObject<Record<string, string>>(
        this.discoveryUrl
      );
      if (data) {
        this.discoveryDocument = data.object;
        this.LOG.info(
          `[${this.provider}] Discovery document successfully loaded.`
        );
      } else if (!data) {
        throw new Error(`[${this.provider}] Discovery document was not found!`);
      } else {
        throw new Error(
          `[${
            this.provider
          }] Error getting discovery document: ${JSON.stringify(data)}`
        );
      }
    }
    return this.discoveryDocument[key];
  }

  private generateTokenRequestConfig(
    response: OAuthResponse
  ): TokenRequestConfig {
    return {
      code: response.code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: response.redirectUrl,
      grant_type: 'authorization_code',
    };
  }
}
