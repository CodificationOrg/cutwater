import { AbstractOAuthService } from './AbstractOAuthService';

export class GoogleOAuthService extends AbstractOAuthService {
  public constructor(clientId: string, clientSecret: string) {
    super('google', clientId, clientSecret, ['openid', 'profile', 'email'], 'https://accounts.google.com');
  }
}
