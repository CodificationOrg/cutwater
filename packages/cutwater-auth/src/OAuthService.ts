import { OAuthClaims } from './OAuthClaims';
import { OAuthResponse } from './OAuthResponse';

export interface OAuthService {
  generateAuthUrl(redirectUrl: string): Promise<string>;
  getClaims(response: OAuthResponse): Promise<OAuthClaims>;
}
