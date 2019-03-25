import {
  CloudFrontEvent,
  CloudFrontHeaders,
  CloudFrontOrigin,
  CloudFrontRequest,
  CloudFrontRequestEvent
} from 'aws-lambda';

const defaultCloudFrontEvent: Function = (): CloudFrontEvent => ({
  config: {
    distributionDomainName: 'd123.cloudfront.net',
    distributionId: 'EDFDVBD6EXAMPLE',
    eventType: 'viewer-request',
    requestId: 'MRVMF7KydIvxMWfJIglgwHQwZsbG2IhRJ07sn9AkKUFSHS9EXAMPLE=='
  }
});

const defaultCloudFrontRequest: Function = (
  headers: CloudFrontHeaders = defaultCloudFrontHeaders(),
  origin?: CloudFrontOrigin
): CloudFrontRequest => ({
  clientIp: '2001:0db8:85a3:0:0:8a2e:0370:7334',
  querystring: 'size=large',
  uri: '/picture.jpg',
  method: 'GET',
  headers: headers,
  origin: origin
});

const defaultCloudFrontRequestEvent: Function = (): CloudFrontRequestEvent => ({
  Records: [
    {
      cf: {
        ...defaultCloudFrontEvent(),
        request: defaultCloudFrontRequest()
      }
    }
  ]
});

const defaultCloudFrontHeaders: Function = (): CloudFrontHeaders => ({
  host: [
    {
      key: 'Host',
      value: 'd111111abcdef8.cloudfront.net'
    }
  ],
  'user-agent': [
    {
      key: 'User-Agent',
      value: 'curl/7.51.0'
    }
  ]
});

const defaultCloudFrontOrigin: Function = (): CloudFrontOrigin => ({
  custom: {
    customHeaders: {
      'my-origin-custom-header': [
        {
          key: 'My-Origin-Custom-Header',
          value: 'Test'
        }
      ]
    },
    domainName: 'example.com',
    keepaliveTimeout: 5,
    path: '/custom_path',
    port: 443,
    protocol: 'https',
    readTimeout: 5,
    sslProtocols: ['TLSv1', 'TLSv1.1']
  }
});

// tslint:disable-next-line:export-name
export const mockCloudFrontRequestEvent: Function = (
  requestEvent?: Partial<CloudFrontRequestEvent>
): CloudFrontRequestEvent => ({
  ...defaultCloudFrontRequestEvent(),
  ...requestEvent
});
