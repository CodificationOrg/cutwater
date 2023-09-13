import { CloudFrontHeaders, CloudFrontRequestEvent } from 'aws-lambda';
import { IncomingHttpHeaders } from 'http';

import { mockCloudFrontRequestEvent } from './CloudFront.mock';
import { LambdaEdgeUtils as lambda } from './LambdaEdgeUtils';

const createCFRequest = (
  eventType = 'origin-request'
): CloudFrontRequestEvent =>
  mockCloudFrontRequestEvent({
    Records: [
      {
        cf: {
          config: {
            eventType,
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
  } as unknown as Partial<CloudFrontRequestEvent>);

const createHeaders = (...headerNames: string[]): IncomingHttpHeaders => {
  const rval: IncomingHttpHeaders = {} as IncomingHttpHeaders;
  let counter = 0;
  headerNames.forEach((header) => {
    rval[header.toLowerCase()] = `Value${counter}`;
    counter++;
  });
  return rval;
};

describe('LambdaEdgeUtils Unit Tests', () => {
  test('isCustomOriginRequestEvent', () => {
    expect(lambda.isCustomOriginRequestEvent(createCFRequest())).toBeTruthy();
    expect(
      lambda.isCustomOriginRequestEvent(createCFRequest('origin-response'))
    ).toBeFalsy();
  });

  const headers: CloudFrontHeaders = lambda.toCloudFrontHeaders(
    createHeaders('Connection', 'Content-Length', 'X-Custom-Header')
  );

  test('toCloudFrontHeaders', () => {
    expect(headers['connection'][0].value).toBe('Value0');
  });

  test('stripOriginRequestHeaders', () => {
    expect(Object.keys(lambda.stripOriginRequestHeaders(headers)).length).toBe(
      1
    );
  });

  test('toIncomingHttpHeaders', () => {
    expect(lambda.toIncomingHttpHeaders(headers)['x-custom-header']).toBe(
      'Value2'
    );
  });
});
