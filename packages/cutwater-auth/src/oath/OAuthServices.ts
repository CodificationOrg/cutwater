import { OAuthClaims, OAuthResponse } from '.';
import { AuthState } from './AuthState';
import { GoogleOAuthService } from './GoogleOAuthService';
import { MicrosoftOAuthService } from './MicrosoftOAuthService';
import { OAuthConnectionConfig } from './OAuthConnectionConfig';
import { OAuthService } from './OAuthService';
import { OAuthServiceConfigSource } from './OAuthServiceConfigSource';
import { OAuthServiceOptions } from './OAuthServiceOptions';
import {
  OAuthServiceProvider,
  OAuthServiceProviderLike,
  toOAuthServiceProvider,
} from './OAuthServiceProvider';

export class OAuthServices {
  private servicesInitialized = false;
  private availableServices: Partial<
    Record<OAuthServiceProvider, OAuthService>
  > = {};

  public constructor(
    private config: OAuthServiceOptions | OAuthServiceConfigSource
  ) {}

  public async generateConnectionConfig(
    provider: OAuthServiceProviderLike,
    redirectUrl: string,
    scope?: string[]
  ): Promise<OAuthConnectionConfig | undefined> {
    const oAuthProvider: OAuthServiceProvider | undefined =
      toOAuthServiceProvider(provider);
    if (!oAuthProvider) {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }
    try {
      const service = await this.findOAuthService(oAuthProvider);
      return {
        provider: service.provider,
        authUrl: await service.generateAuthUrl(redirectUrl, scope),
      };
    } catch (err) {
      throw new Error(
        `Service [${provider}] returned an error while generating connection config: ${JSON.stringify(
          err,
          null,
          2
        )}`
      );
    }
  }

  public async generateConnectionConfigs(
    redirectUrl: string,
    scope?: string[]
  ): Promise<OAuthConnectionConfig[]> {
    const rval: OAuthConnectionConfig[] = [];
    for (const p of Object.keys(OAuthServiceProvider)) {
      const config = await this.generateConnectionConfig(p, redirectUrl, scope);
      if (config) {
        rval.push(config);
      }
    }
    return rval;
  }

  public async getClaims(response: OAuthResponse): Promise<OAuthClaims> {
    const provider: OAuthServiceProvider | undefined =
      AuthState.getOAuthServiceProvider(response);
    if (!provider) {
      throw new Error(`Could not determine provider for response.`);
    }
    return (await this.findOAuthService(provider)).getClaims(response);
  }

  private async findOAuthService(
    provider: OAuthServiceProvider
  ): Promise<OAuthService> {
    const rval = (await this.getAuthServices())[provider];
    if (!rval) {
      throw new Error(`No configuration found for OAuth provider: ${provider}`);
    }
    return rval;
  }

  private async toOAuthServiceOptions(
    src: OAuthServiceConfigSource
  ): Promise<OAuthServiceOptions> {
    const rval: OAuthServiceOptions = {};
    for (const p of Object.keys(OAuthServiceProvider)) {
      const clientId = await src.findClientId(p as OAuthServiceProvider);
      const clientSecret = await src.findClientSecret(
        p as OAuthServiceProvider
      );
      if (clientId && clientSecret) {
        rval[p as OAuthServiceProvider] = { clientId, clientSecret };
      }
    }
    return rval;
  }

  private async getAuthServices(): Promise<
    Partial<Record<OAuthServiceProvider, OAuthService>>
  > {
    if (!this.servicesInitialized) {
      const options =
        'findClientId' in this.config
          ? await this.toOAuthServiceOptions(
              this.config as OAuthServiceConfigSource
            )
          : (this.config as OAuthServiceOptions);

      Object.keys(options).forEach((provider) => {
        const { clientId, clientSecret } =
          options[provider as OAuthServiceProvider] || {};

        if (clientId && clientSecret) {
          switch (provider) {
            case OAuthServiceProvider.GOOGLE: {
              this.availableServices[provider] = new GoogleOAuthService(
                clientId,
                clientSecret
              );
              break;
            }
            case OAuthServiceProvider.MICROSOFT: {
              this.availableServices[provider] = new MicrosoftOAuthService(
                clientId,
                clientSecret
              );
              break;
            }
            default: {
              break;
            }
          }
        }
      });
      this.servicesInitialized = true;
    }
    return this.availableServices;
  }
}
