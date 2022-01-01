import { OAuthServiceProvider } from '.';

export interface OAuthServiceConfigSource {
  findClientId(provider: OAuthServiceProvider): Promise<string | undefined>;
  findClientSecret(provider: OAuthServiceProvider): Promise<string | undefined>;
}
