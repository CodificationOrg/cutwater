import { AbstractOAuthService } from './AbstractOAuthService';

export class MicrosoftOAuthService extends AbstractOAuthService {
  public constructor(clientId: string, clientSecret: string) {
    super(
      'microsoft',
      clientId,
      clientSecret,
      ['openid', 'profile', 'email'],
      'https://login.microsoftonline.com/common/v2.0',
    );
  }
}
