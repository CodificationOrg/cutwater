import { OAuthServiceProvider } from '.';
import { OAuthServiceConfig } from './OAuthServiceConfig';

export type OAuthServiceOptions = Partial<Record<OAuthServiceProvider, OAuthServiceConfig>>;
