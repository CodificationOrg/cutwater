import { Config } from './Config';
import { Env } from './Env';

describe('Env', () => {
  it('correctly returns a dev environment flag', () => {
    Config.put(Env.ENV_STAGE, 'dev');
    expect(Env.isDev()).toBeTruthy();
  });

  it('correctly returns a prod environment flag', () => {
    Config.put(Env.ENV_STAGE, Env.DEFAULT_PROD_STAGE);
    expect(Env.isProd()).toBeTruthy();

    Config.put(Env.ENV_PROD_STAGE, 'production');
    Config.put(Env.ENV_STAGE, 'production');
    expect(Env.isProd()).toBeTruthy();
  });
});
