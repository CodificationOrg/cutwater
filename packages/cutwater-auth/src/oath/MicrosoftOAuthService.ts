import { AbstractOAuthService } from './AbstractOAuthService';

export class MicrosoftOAuthService extends AbstractOAuthService {
  public constructor(clientId: string, clientSecret: string) {
    super('microsoft', clientId, clientSecret, 'https://login.microsoftonline.com/common/v2.0');
  }
}
