import { OAuthResponse } from '.';
import { AuthState } from './AuthState';
import { OAuthServiceProvider } from './OAuthServiceProvider';

const authState = new AuthState(OAuthServiceProvider.MICROSOFT, 'foo');

describe('AuthState', () => {
  it('can generate state', async () => {
    const result = await authState.generateState();
    expect(result).toBeTruthy();
    expect(result.indexOf('MICROSOFT')).not.toBe(-1);
  });

  it('can find the provider for a response', async () => {
    const state = await authState.generateState();
    expect(AuthState.getOAuthServiceProvider({ state } as OAuthResponse)).toBe(OAuthServiceProvider.MICROSOFT);
  });
});
