import { CloudFrontHeaders, CloudFrontResultResponse } from 'aws-lambda';
import { isResponseOk, LoggerFactory, toBodyText } from 'cutwater-core';
import { IncomingMessage } from 'http';

import { toCloudFrontHeaders } from './CloudfrontUtils';

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

export const stripOriginRequestHeaders = (headers: CloudFrontHeaders): CloudFrontHeaders => {
  return stripHeaders(headers, READ_ONLY_HEADERS_ORIGIN_REQUEST);
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

export const copyOriginResponseToCloudFrontResponse = (
  originResponse: IncomingMessage,
  cfResponse: CloudFrontResultResponse,
  callback: (err?: any) => void,
) => {
  cfResponse.status = originResponse.statusCode.toString();
  cfResponse.statusDescription = originResponse.statusMessage;
  cfResponse.headers = stripOriginRequestHeaders(toCloudFrontHeaders(originResponse.headers));
  if (isResponseOk(originResponse)) {
    toBodyText(originResponse).then(bodyText => {
      cfResponse.bodyEncoding = 'text';
      cfResponse.body = bodyText;
      callback();
    });
  } else {
    callback();
  }
};
