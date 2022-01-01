import { AbstractOAuthService } from './AbstractOAuthService';
import { OAuthServiceProvider } from './OAuthServiceProvider';

export class MicrosoftOAuthService extends AbstractOAuthService {
  public constructor(clientId: string, clientSecret: string) {
    super(OAuthServiceProvider.MICROSOFT, clientId, clientSecret, 'https://login.microsoftonline.com/common/v2.0');
  }
}
