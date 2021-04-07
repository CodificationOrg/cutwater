import { OAuthServiceFactory } from './OAuthServiceFactory';
import { OAuthServiceOptions } from './OAuthServiceOptions';
import { OAuthServiceProvider } from './OAuthServiceProvider';

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

describe('OAuthServiceFactory', () => {
  it('can create a configured instance', () => {
    const factory = new OAuthServiceFactory(opts);
    expect(factory).toBeTruthy();
  });

  it('can create an auth url', async () => {
    const factory = new OAuthServiceFactory(opts);
    const url = await factory.generateAuthUrl(OAuthServiceProvider.GOOGLE, 'https://example.com/authCallback');
    expect(url).toBeTruthy();
    expect(url.indexOf('google')).not.toBe(-1);
  });
  it('can create an auth url using provider string', async () => {
    const factory = new OAuthServiceFactory(opts);
    const url = await factory.generateAuthUrl('microsoft', 'https://example.com/authCallback');
    expect(url).toBeTruthy();
    expect(url.indexOf('microsoft')).not.toBe(-1);
  });

  it('fails with invalid provider string', async () => {
    const factory = new OAuthServiceFactory(opts);
    try {
      await factory.generateAuthUrl('microshift', 'https://example.com/authCallback');
      fail('Should have thrown error.');
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
