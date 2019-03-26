import {
  CloudFrontCustomOrigin,
  CloudFrontHeaders,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponseEvent,
  CloudFrontResultResponse
} from 'aws-lambda';
import { IncomingHttpHeaders, IncomingMessage } from 'http';

import { HttpUtils } from '@codification/cutwater-node-core';

const BLACK_LISTED_HEADERS: string[] = [
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
  'X-Real-IP'
].map(header => header.toLowerCase());

const READ_ONLY_HEADERS_VIEWER_REQUEST: string[] = ['Content-Length', 'Host', 'Transfer-Encoding', 'Via'].map(header =>
  header.toLowerCase()
);

const READ_ONLY_HEADERS_ORIGIN_REQUEST: string[] = [
  'Accept-Encoding',
  'Content-Length',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Range',
  'Transfer-Encoding',
  'Via'
].map(header => header.toLowerCase());

const READ_ONLY_HEADERS_ORIGIN_RESPONSE: string[] = ['Transfer-Encoding', 'Via'].map(header => header.toLowerCase());

const READ_ONLY_HEADERS_VIEWER_RESPONSE: string[] = [
  'Content-Encoding',
  'Content-Length',
  'Transfer-Encoding',
  'Warning',
  'Via'
].map(header => header.toLowerCase());

/**
 * @beta
 */
export class LambdaEdgeUtils {
  public static stripHeaders(headers: CloudFrontHeaders, headerList: string[]): CloudFrontHeaders {
    const rval: CloudFrontHeaders = {};
    const fullHeaderList: string[] = [];
    fullHeaderList.push(...headerList, ...BLACK_LISTED_HEADERS);
    Object.keys(headers)
      .filter(headerName => fullHeaderList.indexOf(headerName) === -1)
      .forEach(headerName => {
        rval[headerName] = headers[headerName];
      });
    return rval;
  }

  public static stripViewerRequestHeaders(headers: CloudFrontHeaders): CloudFrontHeaders {
    return LambdaEdgeUtils.stripHeaders(headers, READ_ONLY_HEADERS_VIEWER_REQUEST);
  }

  public static stripOriginRequestHeaders(headers: CloudFrontHeaders): CloudFrontHeaders {
    return LambdaEdgeUtils.stripHeaders(headers, READ_ONLY_HEADERS_ORIGIN_REQUEST);
  }

  public static stripViewerResponseHeaders(headers: CloudFrontHeaders): CloudFrontHeaders {
    return LambdaEdgeUtils.stripHeaders(headers, READ_ONLY_HEADERS_VIEWER_RESPONSE);
  }

  public static stripOriginResponseHeaders(headers: CloudFrontHeaders): CloudFrontHeaders {
    return LambdaEdgeUtils.stripHeaders(headers, READ_ONLY_HEADERS_ORIGIN_RESPONSE);
  }

  public static toCloudFrontHeaders(headers: IncomingHttpHeaders): CloudFrontHeaders {
    const rval: CloudFrontHeaders = {};
    let value: string | undefined | string[];
    Object.keys(headers).forEach(headerName => {
      value = headers[headerName];
      if (typeof value === 'string') {
        value = [value];
      }
      if (typeof value !== 'undefined') {
        rval[headerName.toLowerCase()] = value.map(headerValue => ({ key: headerName, value: headerValue }));
      }
    });
    return rval;
  }

  public static originResponseToCloudFrontResultResponse(
    originResponse: IncomingMessage
  ): Promise<CloudFrontResultResponse> {
    const rval: CloudFrontResultResponse = {} as CloudFrontResultResponse;
    rval.status = (originResponse.statusCode ? originResponse.statusCode : 500).toString();
    rval.statusDescription = originResponse.statusMessage;
    rval.headers = LambdaEdgeUtils.stripOriginRequestHeaders(
      LambdaEdgeUtils.toCloudFrontHeaders(originResponse.headers)
    );
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
  }

  public static toCloudFrontCustomOrigin(request: CloudFrontRequest): CloudFrontCustomOrigin {
    if (request && request.origin && request.origin.custom) {
      return request.origin.custom;
    } else {
      throw new Error('Request does not contain a custom origin.');
    }
  }

  public static isCustomOriginRequestEvent(event: CloudFrontRequestEvent): boolean {
    const { config, request } = event.Records[0].cf;
    return config.eventType === 'origin-request' && LambdaEdgeUtils.toCloudFrontCustomOrigin(request) ? true : false;
  }

  public static isCustomOriginResponseEvent(event: CloudFrontResponseEvent): boolean {
    const { config } = event.Records[0].cf;
    return config.eventType === 'origin-response';
  }

  public static toIncomingHttpHeaders(headers?: CloudFrontHeaders): IncomingHttpHeaders {
    const rval: IncomingHttpHeaders = {};
    if (headers) {
      Object.keys(headers).forEach(name => {
        // tslint:disable-next-line:typedef
        const header = headers[name];
        rval[header[0].key] = header.length > 1 ? header.map(obj => obj.value) : header[0].value;
      });
    }
    return rval;
  }
}
