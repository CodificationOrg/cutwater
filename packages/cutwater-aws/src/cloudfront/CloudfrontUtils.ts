import { CloudFrontHeaders, CloudFrontRequestEvent } from 'aws-lambda';
import { LoggerFactory } from 'cutwater-core';
import { IncomingHttpHeaders } from 'http';

const LOG = LoggerFactory.getLogger();

export const isCustomOrigin = (event: CloudFrontRequestEvent): boolean => {
  return event.Records[0].cf.request.origin.custom ? true : false;
};

export const toIncomingHttpHeaders = (headers?: CloudFrontHeaders): IncomingHttpHeaders => {
  const rval: IncomingHttpHeaders = {};
  if (headers) {
    Object.keys(headers).forEach(name => {
      const header = headers[name];
      rval[header[0].key] = header.map(obj => obj.value);
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
