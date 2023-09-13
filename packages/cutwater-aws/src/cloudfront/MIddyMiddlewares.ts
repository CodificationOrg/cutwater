import * as middy from '@middy/core';
import {
  CloudFrontCustomOrigin,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
  CloudFrontResponseEvent,
  CloudFrontResultResponse,
} from 'aws-lambda';
import {
  request as HttpRequest,
  IncomingHttpHeaders,
  IncomingMessage,
  RequestOptions,
} from 'node:http';

import { Config } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { HttpUtils } from '@codification/cutwater-node-core';

import { LambdaEdgeUtils } from './LambdaEdgeUtils';

const LOG: Logger = LoggerFactory.getLogger();

/**
 * @beta
 */
export interface OriginRequestConfig {
  filter: (request: CloudFrontRequest) => void;
}

/**
 * @beta
 */
export interface CloudFrontOriginRequestEvent extends CloudFrontRequestEvent {
  originResponse?: CloudFrontResultResponse;
}

const toRequestOptions = (
  req: CloudFrontRequest,
  origin: CloudFrontCustomOrigin
): RequestOptions => {
  const rval: RequestOptions = {};
  rval.protocol = origin.protocol + ':';
  rval.hostname = origin.domainName;
  rval.path = `${req.uri}${req.querystring ? '?' + req.querystring : ''}`;
  rval.method = req.method;

  const incomingHeaders: IncomingHttpHeaders =
    LambdaEdgeUtils.toIncomingHttpHeaders(req.headers);
  rval.headers = incomingHeaders;
  if (origin.customHeaders) {
    rval.headers = HttpUtils.mergeHeaders(
      incomingHeaders,
      LambdaEdgeUtils.toIncomingHttpHeaders(origin.customHeaders)
    );
  }
  return rval;
};

/**
 * @beta
 */
export const withOriginRequestResponse = (
  config?: OriginRequestConfig
): middy.MiddlewareObj<
  CloudFrontOriginRequestEvent,
  CloudFrontResultResponse
> => {
  const before = async (
    req: middy.Request<CloudFrontOriginRequestEvent, CloudFrontResultResponse>
  ): Promise<void> => {
    if (LambdaEdgeUtils.isCustomOriginRequestEvent(req.event)) {
      const request: CloudFrontRequest = req.event.Records[0].cf.request;
      if (config) {
        config.filter(request);
      }
      const origin: CloudFrontCustomOrigin =
        LambdaEdgeUtils.toCloudFrontCustomOrigin(request);
      const options: RequestOptions = toRequestOptions(request, origin);
      LOG.trace('Origin request options: %j', options);
      HttpRequest(options, async (response: IncomingMessage) => {
        req.event.originResponse =
          await LambdaEdgeUtils.originResponseToCloudFrontResultResponse(
            response
          );
      });
    } else {
      LOG.debug(
        'Skipping middleware because event is not a custom Origin-Request.'
      );
    }
  };

  return {
    before,
  };
};

const findPrefixedHeaders = (
  headers: IncomingHttpHeaders,
  prefix: string,
  stripPrefix = false
): IncomingHttpHeaders => {
  const rval: IncomingHttpHeaders = {};
  Object.keys(headers).forEach((header) => {
    if (header.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {
      const headerName: string = stripPrefix
        ? header.substr(prefix.length)
        : header;
      rval[headerName] = headers[header];
    }
  });
  return rval;
};

/**
 * @beta
 */
export const withCustomOriginRequestHeaders = (
  customHeaderPrefix = 'x-custom-'
): middy.MiddlewareObj<CloudFrontRequestEvent, CloudFrontResultResponse> => {
  const before = async (
    req: middy.Request<CloudFrontRequestEvent, CloudFrontResultResponse>
  ): Promise<void> => {
    if (LambdaEdgeUtils.isCustomOriginRequestEvent(req.event)) {
      const request: CloudFrontRequest = req.event.Records[0].cf.request;
      const origin: CloudFrontCustomOrigin =
        LambdaEdgeUtils.toCloudFrontCustomOrigin(request);
      const headers: IncomingHttpHeaders =
        LambdaEdgeUtils.toIncomingHttpHeaders(request.headers);
      const customHeaders: IncomingHttpHeaders = findPrefixedHeaders(
        LambdaEdgeUtils.toIncomingHttpHeaders(origin.customHeaders),
        customHeaderPrefix,
        true
      );
      request.headers = LambdaEdgeUtils.toCloudFrontHeaders(
        HttpUtils.mergeHeaders(headers, customHeaders, true)
      );
    } else {
      LOG.debug(
        'Skipping middleware because event is not a custom Origin-Request.'
      );
    }
  };

  return { before };
};

/**
 * @beta
 */
export const withRequestHeaderConfig = (
  customHeaderPrefix = 'x-config-'
): middy.MiddlewareObj<CloudFrontRequestEvent, CloudFrontResultResponse> => {
  const before = async (
    req: middy.Request<CloudFrontRequestEvent, CloudFrontResultResponse>
  ): Promise<void> => {
    if (LambdaEdgeUtils.isCustomOriginRequestEvent(req.event)) {
      const request: CloudFrontRequest = req.event.Records[0].cf.request;
      const origin: CloudFrontCustomOrigin =
        LambdaEdgeUtils.toCloudFrontCustomOrigin(request);
      const customHeaders: IncomingHttpHeaders = findPrefixedHeaders(
        LambdaEdgeUtils.toIncomingHttpHeaders(origin.customHeaders),
        customHeaderPrefix,
        true
      );
      Object.keys(customHeaders).forEach((header) => {
        const headerValue: string | string[] = customHeaders[header] || '';
        Config.put(header, headerValue.toString());
        LOG.debug(
          'Adding [%s] config value: %s',
          header,
          headerValue.toString()
        );
      });
    } else {
      LOG.debug(
        'Skipping middleware because event is not a custom Origin-Request.'
      );
    }
  };

  return { before };
};

/**
 * @beta
 */
export const withOriginResponseHeaders = (
  config: IncomingHttpHeaders
): middy.MiddlewareObj<CloudFrontResponseEvent, CloudFrontResponse> => {
  const before = async (
    req: middy.Request<CloudFrontResponseEvent, CloudFrontResponse>
  ): Promise<void> => {
    if (LambdaEdgeUtils.isCustomOriginResponseEvent(req.event)) {
      const response: CloudFrontResponse = req.event.Records[0].cf.response;
      const mergedHeaders: IncomingHttpHeaders = HttpUtils.mergeHeaders(
        LambdaEdgeUtils.toIncomingHttpHeaders(response.headers),
        config
      );
      response.headers = LambdaEdgeUtils.stripOriginResponseHeaders(
        LambdaEdgeUtils.toCloudFrontHeaders(mergedHeaders)
      );
    } else {
      LOG.debug('Skipping middleware because event is not a Origin-Response.');
    }
  };

  return { before };
};
