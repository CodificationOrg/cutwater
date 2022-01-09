import { OAuthResponse } from '.';
import { GoogleOAuthService } from './GoogleOAuthService';

const service = new GoogleOAuthService(process.env['GOOGLE_CLIENT']!, process.env['GOOGLE_SECRET']!);

const response: OAuthResponse = {
  code: process.env['GOOGLE_CODE'] || '',
  state: process.env['GOOGLE_STATE'] || '',
  redirectUrl: process.env['GOOGLE_REDIRECT'] || '',
};

describe('GoogleOAuthService', () => {
  describe('generateAuthUrl', () => {
    it('can create a auth url', async () => {
      const result = await service.generateAuthUrl(process.env['GOOGLE_REDIRECT']!);
      console.log(result);
      expect(result).toBeTruthy();
      expect(result.startsWith('https://')).toBeTruthy();
    });
  });

  describe('getClaims', () => {
    if (process.env['GOOGLE_CODE']) {
      it('can fetch claims', async () => {
        const result = await service.getClaims(response);
        console.log(result);
        expect(result).toBeTruthy();
      });
    }
  });
});
