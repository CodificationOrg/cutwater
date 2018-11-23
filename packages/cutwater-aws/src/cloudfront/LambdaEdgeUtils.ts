import { CloudFrontHeaders, CloudFrontRequestEvent, CloudFrontResponseEvent, CloudFrontResultResponse } from 'aws-lambda';
import { HttpUtils, LoggerFactory } from 'cutwater-core';
import { IncomingHttpHeaders, IncomingMessage } from 'http';

const BLACK_LISTED_HEADERS = [
  'Connection',
  'Expect',
  'Keep-alive',
  'Proxy-Authenticate',
  'Proxy-Authorization',
  'Proxy-Connection',
  'Trailer',
  'Upgrade',
  'X-Accel-Buffering',
  'X-Accel-Charset',
  'X-Accel-Limit-Rate',
  'X-Accel-Redirect',
  'X-Cache',
  'X-Forwarded-Proto',
  'X-Real-IP',
].map(header => header.toLowerCase());

const READ_ONLY_HEADERS_VIEWER_REQUEST = ['Content-Length', 'Host', 'Transfer-Encoding', 'Via'].map(header =>
  header.toLowerCase(),
);

const READ_ONLY_HEADERS_ORIGIN_REQUEST = [
  'Accept-Encoding',
  'Content-Length',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Range',
  'Transfer-Encoding',
  'Via',
].map(header => header.toLowerCase());

const READ_ONLY_HEADERS_ORIGIN_RESPONSE = ['Transfer-Encoding', 'Via'].map(header => header.toLowerCase());

const READ_ONLY_HEADERS_VIEWER_RESPONSE = ['Content-Encoding', 'Content-Length', 'Transfer-Encoding', 'Warning', 'Via'].map(
  header => header.toLowerCase(),
);

const LOG = LoggerFactory.getLogger();

export const stripViewerRequestHeaders = (headers: CloudFrontHeaders): CloudFrontHeaders => {
  return stripHeaders(headers, READ_ONLY_HEADERS_VIEWER_REQUEST);
};

export const stripOriginRequestHeaders = (headers: CloudFrontHeaders): CloudFrontHeaders => {
  return stripHeaders(headers, READ_ONLY_HEADERS_ORIGIN_REQUEST);
};

export const stripViewerResponseHeaders = (headers: CloudFrontHeaders): CloudFrontHeaders => {
  return stripHeaders(headers, READ_ONLY_HEADERS_VIEWER_RESPONSE);
};

export const stripOriginResponseHeaders = (headers: CloudFrontHeaders): CloudFrontHeaders => {
  return stripHeaders(headers, READ_ONLY_HEADERS_ORIGIN_RESPONSE);
};

const stripHeaders = (headers: CloudFrontHeaders, headerList: string[]): CloudFrontHeaders => {
  const rval: CloudFrontHeaders = {};
  const fullHeaderList = [];
  fullHeaderList.push(...headerList, ...BLACK_LISTED_HEADERS);
  Object.keys(headers)
    .filter(headerName => fullHeaderList.indexOf(headerName) === -1)
    .forEach(headerName => {
      rval[headerName] = headers[headerName];
    });
  return rval;
};

export const originResponseToCloudFrontResultResponse = (
  originResponse: IncomingMessage,
): Promise<CloudFrontResultResponse> => {
  const rval = {} as CloudFrontResultResponse;
  rval.status = originResponse.statusCode.toString();
  rval.statusDescription = originResponse.statusMessage;
  rval.headers = stripOriginRequestHeaders(toCloudFrontHeaders(originResponse.headers));
  if (HttpUtils.isResponseOk(originResponse)) {
    return new Promise((resolve, reject) => {
      HttpUtils.toBodyText(originResponse)
        .then(bodyText => {
          rval.bodyEncoding = 'text';
          rval.body = bodyText;
          resolve(rval);
        })
        .catch(reason => reject(reason));
    });
  } else {
    return Promise.resolve(rval);
  }
};

export const isCustomOriginRequestEvent = (event: CloudFrontRequestEvent): boolean => {
  const { config, request } = event.Records[0].cf;
  const origin = request.origin ? request.origin.custom : undefined;
  return config.eventType === 'origin-request' && origin ? true : false;
};

export const isCustomOriginResponseEvent = (event: CloudFrontResponseEvent): boolean => {
  const { config } = event.Records[0].cf;
  return config.eventType === 'origin-response';
};

export const toIncomingHttpHeaders = (headers?: CloudFrontHeaders): IncomingHttpHeaders => {
  const rval: IncomingHttpHeaders = {};
  if (headers) {
    Object.keys(headers).forEach(name => {
      const header = headers[name];
      rval[header[0].key] = header.length > 1 ? header.map(obj => obj.value) : header[0].value;
    });
  }
  return rval;
};

export const toCloudFrontHeaders = (headers: IncomingHttpHeaders): CloudFrontHeaders => {
  const rval: CloudFrontHeaders = {};
  let value: string | number | string[];
  Object.keys(headers).forEach(headerName => {
    value = headers[headerName];
    if (typeof value === 'number') {
      value = headers[headerName].toString();
    }
    if (typeof value === 'string') {
      value = [value];
    }
    rval[headerName.toLowerCase()] = value.map(headerValue => ({ key: headerName, value: headerValue }));
  });
  return rval;
};
