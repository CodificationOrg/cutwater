import { CloudFrontRequestEvent } from 'aws-lambda';
import { IncomingHttpHeaders } from 'http';
import * as test from 'tape';

import {
  isCustomOriginRequestEvent,
  stripOriginRequestHeaders,
  toCloudFrontHeaders,
  toIncomingHttpHeaders,
} from './LambdaEdgeUtils';

test('LambdaEdgeUtils Unit Tests', assert => {
  const req = createCFRequest();
  assert.ok(isCustomOriginRequestEvent(req), 'correctly identifies CF custom origin-request event');
  req.Records[0].cf.config.eventType = 'origin-response';
  assert.notOk(isCustomOriginRequestEvent(req), 'correctly identifies CF event that is not a custom origin-request');

  let headers = toCloudFrontHeaders(createHeaders('Connection', 'Content-Length', 'X-Custom-Header'));
  assert.equal(headers.connection[0].value, 'Value0', 'can properly convert IncomingHttpHeaders to CloudFrontHeaders');

  headers = stripOriginRequestHeaders(headers);
  assert.equal(Object.keys(headers).length, 1, 'correctly removes invalid headers for orgin-request event');

  assert.equal(
    toIncomingHttpHeaders(headers)['x-custom-header'],
    'Value2',
    'correctly converts CloudFrontHeaders to IncomingHttpHeaders.',
  );
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

const createHeaders = (...headerNames: string[]): IncomingHttpHeaders => {
  const rval = {} as IncomingHttpHeaders;
  let counter = 0;
  headerNames.forEach(header => {
    rval[header.toLowerCase()] = `Value${counter}`;
    counter++;
  });
  return rval;
};
