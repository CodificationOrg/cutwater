import { OAuthServiceProvider } from '.';

export interface OAuthConnectionConfig {
  provider: OAuthServiceProvider;
  authUrl: string;
}
