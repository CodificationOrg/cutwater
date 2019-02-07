import * as test from 'tape';

import { GotUtils } from './GotUtils';

const GOOGLE_URL = 'https://www.google.com';
const GOOGLE_LOGO_URL = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
const FAKE_URL = 'https://comix-beta.codification.org/api/foo/next';

test('GotUtils Unit Tests', assert => {
  assert.plan(4);
  GotUtils.fetchBodyBuffer(GOOGLE_LOGO_URL).subscribe(data => assert.ok(data, 'produces a buffer'), err => assert.error(err));
  GotUtils.fetchBodyBuffer(FAKE_URL).subscribe(
    data => assert.fail('should throw error'),
    err => assert.ok(err, 'properly throws error for bad url'),
  );
  GotUtils.fetchBodyText(GOOGLE_URL).subscribe(
    text => assert.ok(text.indexOf('<html') > -1, 'produces correct body text'),
    err => assert.error(err),
  );
  GotUtils.fetchBodyText(FAKE_URL, { throwHttpErrors: false }).subscribe(
    text => assert.fail('should throw error, ignoring throwHttpErrors option'),
    err => assert.ok(err, 'properly throws error for bad url, ignoring throwHttpErrors option'),
  );
});
