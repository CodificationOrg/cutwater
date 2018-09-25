import { CloudFrontRequestEvent } from 'aws-lambda';
import * as test from 'tape';

import { isCustomOriginRequestEvent } from './LambdaEdgeUtils';

test('LambdaEdgeUtils Unit Tests', assert => {
  const req = createCFRequest();
  assert.ok(isCustomOriginRequestEvent(req), 'correctly identifies CF custom origin-request event.');
  req.Records[0].cf.config.eventType = 'origin-response';
  assert.notOk(isCustomOriginRequestEvent(req), 'correctly identifies CF event that is not a custom origin-request.');

  assert.end();
});

const createCFRequest = (): CloudFrontRequestEvent =>
  ({
    Records: [
      {
        cf: {
          config: {
            eventType: 'origin-request',
          },
          request: {
            origin: {
              custom: {
                customHeaders: {
                  'my-origin-custom-header': [
                    {
                      key: 'My-Origin-Custom-Header',
                      value: 'Test',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ],
  } as CloudFrontRequestEvent);
