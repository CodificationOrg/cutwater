import { AbstractOAuthService } from './AbstractOAuthService';
import { OAuthServiceProvider } from './OAuthServiceProvider';

export class GoogleOAuthService extends AbstractOAuthService {
  public constructor(clientId: string, clientSecret: string) {
    super(OAuthServiceProvider.GOOGLE, clientId, clientSecret, 'https://accounts.google.com');
  }
}
