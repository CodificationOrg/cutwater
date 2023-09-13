import { Config } from '@codification/cutwater-core';
import { OAuthResponse } from '.';
import { GoogleOAuthService } from './GoogleOAuthService';

const service = new GoogleOAuthService(
  Config.getRequired('GOOGLE_CLIENT'),
  Config.getRequired('GOOGLE_SECRET')
);

const response: OAuthResponse = {
  code: process.env['GOOGLE_CODE'] || '',
  state: process.env['GOOGLE_STATE'] || '',
  redirectUrl: process.env['GOOGLE_REDIRECT'] || '',
};

describe('GoogleOAuthService', () => {
  describe('generateAuthUrl', () => {
    it('can create a auth url', async () => {
      const result = await service.generateAuthUrl(
        Config.getRequired('GOOGLE_REDIRECT')
      );
      expect(result).toBeTruthy();
      expect(result.startsWith('https://')).toBeTruthy();
    });
  });

  describe('getClaims', () => {
    if (process.env['GOOGLE_CODE']) {
      it('can fetch claims', async () => {
        const result = await service.getClaims(response);
        expect(result).toBeTruthy();
      });
    }
  });
});
