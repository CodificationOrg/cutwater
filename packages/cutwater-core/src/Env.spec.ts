import * as test from 'tape';

import { Config } from './Config';
import { Env } from './Env';

test('Env Unit Tests', assert => {
  Config.put(Env.ENV_STAGE, 'dev');
  assert.is(Env.isDev(), true, 'correctly returns dev status');

  Config.put(Env.ENV_STAGE, Env.DEFAULT_PROD_STAGE);
  assert.is(Env.isProd(), true, 'correctly returns prod status');

  Config.put(Env.ENV_PROD_STAGE, 'production');
  Config.put(Env.ENV_STAGE, 'production');
  assert.is(Env.isProd(), true, 'correctly returns prod with custom production stage');

  assert.end();
});
