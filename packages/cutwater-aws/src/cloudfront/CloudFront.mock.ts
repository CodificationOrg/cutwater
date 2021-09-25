import {
  CloudFrontEvent,
  CloudFrontHeaders,
  CloudFrontOrigin,
  CloudFrontRequest,
  CloudFrontRequestEvent,
} from 'aws-lambda';

const defaultCloudFrontEvent = (): CloudFrontEvent => ({
  config: {
    distributionDomainName: 'd123.cloudfront.net',
    distributionId: 'EDFDVBD6EXAMPLE',
    eventType: 'viewer-request',
    requestId: 'MRVMF7KydIvxMWfJIglgwHQwZsbG2IhRJ07sn9AkKUFSHS9EXAMPLE==',
  },
});

const defaultCloudFrontHeaders = (): CloudFrontHeaders => ({
  host: [
    {
      key: 'Host',
      value: 'd111111abcdef8.cloudfront.net',
    },
  ],
  'user-agent': [
    {
      key: 'User-Agent',
      value: 'curl/7.51.0',
    },
  ],
});

const defaultCloudFrontRequest = (
  headers: CloudFrontHeaders = defaultCloudFrontHeaders(),
  origin?: CloudFrontOrigin,
): CloudFrontRequest => ({
  clientIp: '2001:0db8:85a3:0:0:8a2e:0370:7334',
  querystring: 'size=large',
  uri: '/picture.jpg',
  method: 'GET',
  headers,
  origin,
});

const defaultCloudFrontRequestEvent = (): CloudFrontRequestEvent => ({
  Records: [
    {
      cf: {
        ...defaultCloudFrontEvent(),
        request: defaultCloudFrontRequest(),
      },
    },
  ],
});

export const mockCloudFrontRequestEvent = (requestEvent?: Partial<CloudFrontRequestEvent>): CloudFrontRequestEvent => ({
  ...defaultCloudFrontRequestEvent(),
  ...requestEvent,
});
