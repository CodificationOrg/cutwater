import { HttpClient } from '@codification/cutwater-node-core';
import { AbstractOAuthService } from './AbstractOAuthService';
import { OAuthServiceProvider } from './OAuthServiceProvider';

export class GoogleOAuthService extends AbstractOAuthService {
  public constructor(
    clientId: string,
    clientSecret: string,
    httpClient = HttpClient.create()
  ) {
    super(
      httpClient,
      OAuthServiceProvider.GOOGLE,
      clientId,
      clientSecret,
      'https://accounts.google.com'
    );
  }
}
