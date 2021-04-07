import { MicrosoftOAuthService } from './MicrosoftOAuthService';

const service = new MicrosoftOAuthService(process.env['MICROSOFT_CLIENT']!, process.env['MICROSOFT_SECRET']!);

describe('MicrosoftOAuthService', () => {
  it('can create a auth url', async () => {
    const result = await service.generateAuthUrl('https://localhost:8080/authCallback');
    expect(result).toBeTruthy();
    expect(result.startsWith('https://')).toBeTruthy();
  });
});
