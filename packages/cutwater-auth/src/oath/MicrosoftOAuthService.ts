import { HttpClient } from '@codification/cutwater-node-core';
import { AbstractOAuthService } from './AbstractOAuthService';
import { OAuthServiceProvider } from './OAuthServiceProvider';

export class MicrosoftOAuthService extends AbstractOAuthService {
  public constructor(
    clientId: string,
    clientSecret: string,
    httpClient = HttpClient.create()
  ) {
    super(
      httpClient,
      OAuthServiceProvider.MICROSOFT,
      clientId,
      clientSecret,
      'https://login.microsoftonline.com/common/v2.0'
    );
  }
}
