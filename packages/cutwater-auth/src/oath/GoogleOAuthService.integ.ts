import { GoogleOAuthService } from './GoogleOAuthService';

const service = new GoogleOAuthService(process.env['GOOGLE_CLIENT']!, process.env['GOOGLE_SECRET']!);

describe('GoogleOAuthService', () => {
  it('can create a auth url', async () => {
    const result = await service.generateAuthUrl('https://localhost:8080/authCallback');
    expect(result).toBeTruthy();
    expect(result.startsWith('https://')).toBeTruthy();
  });
});
