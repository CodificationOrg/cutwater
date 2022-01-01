import { OAuthServiceConfigSource } from './OAuthServiceConfigSource';
import { OAuthServiceOptions } from './OAuthServiceOptions';
import { OAuthServiceProvider } from './OAuthServiceProvider';
import { OAuthServices } from './OAuthServices';

const opts: OAuthServiceOptions = {
  [OAuthServiceProvider.GOOGLE]: {
    clientId: 'foo',
    clientSecret: 'bar',
  },
  [OAuthServiceProvider.MICROSOFT]: {
    clientId: '123',
    clientSecret: 'abc',
  },
};

const configSrc: OAuthServiceConfigSource = {
  findClientId: async (provider: OAuthServiceProvider): Promise<string | undefined> => {
    return opts[provider]?.clientId;
  },
  findClientSecret: async (provider: OAuthServiceProvider): Promise<string | undefined> => {
    return opts[provider]?.clientSecret;
  },
};

describe('OAuthServices', () => {
  it('can create a configured instance with opts', async () => {
    const authServices = await OAuthServices.create(opts);
    expect(authServices).toBeTruthy();
  });
  it('can create a configured instance with a source', async () => {
    const authServices = await OAuthServices.create(configSrc);
    expect(authServices).toBeTruthy();
  });

  it('can create an auth url', async () => {
    const authServices = await OAuthServices.create(opts);
    const url = (
      await authServices.generateConnectionConfig(OAuthServiceProvider.GOOGLE, 'https://example.com/authCallback')
    )?.authUrl;
    expect(url).toBeTruthy();
    expect(url!.indexOf('google')).not.toBe(-1);
  }, 10000);
  it('can create an auth url using provider string', async () => {
    const authServices = await OAuthServices.create(configSrc);
    const url = (await authServices.generateConnectionConfig('microsoft', 'https://example.com/authCallback'))?.authUrl;
    expect(url).toBeTruthy();
    expect(url!.indexOf('microsoft')).not.toBe(-1);
  }, 10000);

  it('fails with invalid provider string', async () => {
    const authServices = await OAuthServices.create(opts);
    try {
      await authServices.generateConnectionConfig('microshift', 'https://example.com/authCallback');
      fail('Should have thrown error.');
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
