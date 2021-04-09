import { OAuthClaims, OAuthResponse } from '.';
import { AuthState } from './AuthState';
import { GoogleOAuthService } from './GoogleOAuthService';
import { MicrosoftOAuthService } from './MicrosoftOAuthService';
import { OAuthService } from './OAuthService';
import { OAuthServiceOptions } from './OAuthServiceOptions';
import { OAuthServiceProvider, toOAuthServiceProvider } from './OAuthServiceProvider';

export class OAuthServiceFactory {
  private readonly AUTH_SERVICES: Partial<Record<OAuthServiceProvider, OAuthService>> = {};

  public constructor(private readonly options: Partial<OAuthServiceOptions>) {
    Object.keys(options).forEach(provider => {
      const { clientId, clientSecret } = this.options[provider]!;
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

  public generateAuthUrl(
    provider: OAuthServiceProvider | string,
    redirectUrl: string,
    scope?: string[],
  ): Promise<string> {
    return this.findProvider(provider).generateAuthUrl(redirectUrl, scope);
  }

  public getClaims(response: OAuthResponse): Promise<OAuthClaims> {
    return this.findProvider(AuthState.getOAuthServiceProvider(response)).getClaims(response);
  }

  private findProvider(provider: OAuthServiceProvider | string | undefined): OAuthService {
    const oAuthProvider: OAuthServiceProvider | undefined =
      typeof provider === 'string' ? toOAuthServiceProvider(provider) : provider ? provider : undefined;
    if (!oAuthProvider) {
      throw new Error(`Unkonwn OAuth provider: ${provider}`);
    }
    const rval = this.AUTH_SERVICES[oAuthProvider];
    if (!rval) {
      throw new Error(`No configuration found for OAuth provider: ${provider}`);
    }
    return rval;
  }
}
