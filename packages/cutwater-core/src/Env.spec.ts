import { Config } from './Config';
import { Env } from './Env';

describe('Env Unit Tests', () => {
  test('isDev', () => {
    Config.put(Env.ENV_STAGE, 'dev');
    expect(Env.isDev()).toBeTruthy();
  });

  test('isProd', () => {
    Config.put(Env.ENV_STAGE, Env.DEFAULT_PROD_STAGE);
    expect(Env.isProd()).toBeTruthy();

    Config.put(Env.ENV_PROD_STAGE, 'production');
    Config.put(Env.ENV_STAGE, 'production');
    expect(Env.isProd()).toBeTruthy();
  });
});
