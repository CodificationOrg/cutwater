import { OAuthServiceConfig } from './OAuthServiceConfig';
import { OAuthServiceProvider } from './OAuthServiceProvider';

export type OAuthServiceOptions = Record<OAuthServiceProvider, OAuthServiceConfig>;
