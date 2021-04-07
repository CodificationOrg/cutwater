import { OAuthResponse } from '.';
import { AuthState } from './AuthState';
import { OAuthServiceProvider } from './OAuthServiceProvider';

const authState = new AuthState(OAuthServiceProvider.MICROSOFT, process.env['MICROSOFT_SECRET']!);

describe('AuthState', () => {
  it('can generate state', async () => {
    const result = await authState.generateState();
    expect(result).toBeTruthy();
    expect(result.indexOf('microsoft')).not.toBe(-1);
  });

  it('can find the provider for a response', async () => {
    const state = await authState.generateState();
    expect(AuthState.getOAuthServiceProvider({ state } as OAuthResponse)).toBe(OAuthServiceProvider.MICROSOFT);
  });
});
