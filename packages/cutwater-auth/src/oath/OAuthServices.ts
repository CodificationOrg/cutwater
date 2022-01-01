import { OAuthClaims, OAuthResponse } from '.';
import { AuthState } from './AuthState';
import { GoogleOAuthService } from './GoogleOAuthService';
import { MicrosoftOAuthService } from './MicrosoftOAuthService';
import { OAuthConnectionConfig } from './OAuthConnectionConfig';
import { OAuthService } from './OAuthService';
import { OAuthServiceConfigSource } from './OAuthServiceConfigSource';
import { OAuthServiceOptions } from './OAuthServiceOptions';
import { OAuthServiceProvider, OAuthServiceProviderLike, toOAuthServiceProvider } from './OAuthServiceProvider';

export class OAuthServices {
  private readonly AUTH_SERVICES: Partial<Record<OAuthServiceProvider, OAuthService>> = {};

  public static async create(config: OAuthServiceOptions | OAuthServiceConfigSource): Promise<OAuthServices> {
    const options =
      'findClientId' in config
        ? await OAuthServices.toOAuthServiceOptions(config as OAuthServiceConfigSource)
        : (config as OAuthServiceOptions);
    return new OAuthServices(options);
  }

  private constructor(options: OAuthServiceOptions) {
    Object.keys(options).forEach(provider => {
      const { clientId, clientSecret } = options[provider]!;
      switch (provider) {
        case OAuthServiceProvider.GOOGLE: {
          this.AUTH_SERVICES[provider] = new GoogleOAuthService(clientId, clientSecret);
          break;
        }
        case OAuthServiceProvider.MICROSOFT: {
          this.AUTH_SERVICES[provider] = new MicrosoftOAuthService(clientId, clientSecret);
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  public async generateConnectionConfig(
    provider: OAuthServiceProviderLike,
    redirectUrl: string,
    scope?: string[],
  ): Promise<OAuthConnectionConfig | undefined> {
    const oAuthProvider: OAuthServiceProvider | undefined = toOAuthServiceProvider(provider);
    if (!oAuthProvider) {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }
    const service = this.findOAuthService(oAuthProvider);
    return {
      provider: service.provider,
      authUrl: await service.generateAuthUrl(redirectUrl, scope),
    };
  }

  public async generateConnectionConfigs(redirectUrl: string, scope?: string[]): Promise<OAuthConnectionConfig[]> {
    const rval: OAuthConnectionConfig[] = [];
    for (const p of Object.keys(OAuthServiceProvider)) {
      const config = await this.generateConnectionConfig(p, redirectUrl, scope);
      if (config) {
        rval.push(config);
      }
    }
    return rval;
  }

  public getClaims(response: OAuthResponse): Promise<OAuthClaims> {
    const provider: OAuthServiceProvider | undefined = AuthState.getOAuthServiceProvider(response);
    if (!provider) {
      throw new Error(`Could not determine provider for response.`);
    }
    return this.findOAuthService(provider).getClaims(response);
  }

  private findOAuthService(provider: OAuthServiceProvider): OAuthService {
    const rval = this.AUTH_SERVICES[provider];
    if (!rval) {
      throw new Error(`No configuration found for OAuth provider: ${provider}`);
    }
    return rval;
  }

  private static async toOAuthServiceOptions(src: OAuthServiceConfigSource): Promise<OAuthServiceOptions> {
    const rval: OAuthServiceOptions = {};
    for (const p of Object.keys(OAuthServiceProvider)) {
      const clientId = await src.findClientId(p as OAuthServiceProvider);
      const clientSecret = await src.findClientSecret(p as OAuthServiceProvider);
      if (clientId && clientSecret) {
        rval[p] = { clientId, clientSecret };
      }
    }
    return rval;
  }
}
