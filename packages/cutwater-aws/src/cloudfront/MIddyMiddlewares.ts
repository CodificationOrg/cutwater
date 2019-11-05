import {
  CloudFrontCustomOrigin,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
  CloudFrontResponseEvent,
  CloudFrontResultResponse,
} from 'aws-lambda';
import { ClientRequest, IncomingHttpHeaders, IncomingMessage, request as HttpRequest, RequestOptions } from 'http';
import { IHandlerLambda, IMiddyMiddlewareObject, IMiddyNextFunction } from 'middy';

import { Config } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { HttpUtils } from '@codification/cutwater-node-core';

import { LambdaEdgeUtils } from './LambdaEdgeUtils';

const LOG: Logger = LoggerFactory.getLogger();

/**
 * @beta
 */
// tslint:disable: interface-name
export interface OriginRequestConfig {
  filter: (request: CloudFrontRequest) => void;
}

/**
 * @beta
 */
export interface CloudFrontOriginRequestEvent extends CloudFrontRequestEvent {
  originResponse?: CloudFrontResultResponse;
}

const toRequestOptions = (req: CloudFrontRequest, origin: CloudFrontCustomOrigin): RequestOptions => {
  const rval: RequestOptions = {};
  rval.protocol = origin.protocol + ':';
  rval.hostname = origin.domainName;
  rval.path = `${req.uri}${req.querystring ? '?' + req.querystring : ''}`;
  rval.method = req.method;

  const incomingHeaders: IncomingHttpHeaders = LambdaEdgeUtils.toIncomingHttpHeaders(req.headers);
  rval.headers = incomingHeaders;
  if (origin.customHeaders) {
    rval.headers = HttpUtils.mergeHeaders(incomingHeaders, LambdaEdgeUtils.toIncomingHttpHeaders(origin.customHeaders));
  }
  return rval;
};

/**
 * @beta
 */
export const withOriginRequestResponse = (config?: OriginRequestConfig): IMiddyMiddlewareObject => {
  return {
    before: (
      handler: IHandlerLambda<CloudFrontOriginRequestEvent, CloudFrontResultResponse>,
      next: IMiddyNextFunction,
    ) => {
      if (LambdaEdgeUtils.isCustomOriginRequestEvent(handler.event)) {
        const request: CloudFrontRequest = handler.event.Records[0].cf.request;
        if (config) {
          config.filter(request);
        }
        const origin: CloudFrontCustomOrigin = LambdaEdgeUtils.toCloudFrontCustomOrigin(request);
        const options: RequestOptions = toRequestOptions(request, origin);
        LOG.trace('Origin request options: %j', options);
        const req: ClientRequest = HttpRequest(options, (response: IncomingMessage) => {
          LambdaEdgeUtils.originResponseToCloudFrontResultResponse(response)
            .then(result => {
              handler.event.originResponse = result;
              next();
            })
            .catch(reason => {
              throw new Error(reason);
            });
        });
        req.end();
      } else {
        LOG.debug('Skipping middleware because event is not a custom Origin-Request.');
        next();
      }
    },
  };
};

const findPrefixedHeaders = (
  headers: IncomingHttpHeaders,
  prefix: string,
  stripPrefix = false,
): IncomingHttpHeaders => {
  const rval: IncomingHttpHeaders = {};
  Object.keys(headers).forEach(header => {
    if (header.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {
      const headerName: string = stripPrefix ? header.substr(prefix.length) : header;
      rval[headerName] = headers[header];
    }
  });
  return rval;
};

/**
 * @beta
 */
export const withCustomOriginRequestHeaders = (customHeaderPrefix = 'x-custom-'): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontRequestEvent, CloudFrontResultResponse>, next: IMiddyNextFunction) => {
      if (LambdaEdgeUtils.isCustomOriginRequestEvent(handler.event)) {
        const request: CloudFrontRequest = handler.event.Records[0].cf.request;
        const origin: CloudFrontCustomOrigin = LambdaEdgeUtils.toCloudFrontCustomOrigin(request);
        const headers: IncomingHttpHeaders = LambdaEdgeUtils.toIncomingHttpHeaders(request.headers);
        const customHeaders: IncomingHttpHeaders = findPrefixedHeaders(
          LambdaEdgeUtils.toIncomingHttpHeaders(origin.customHeaders),
          customHeaderPrefix,
          true,
        );
        request.headers = LambdaEdgeUtils.toCloudFrontHeaders(HttpUtils.mergeHeaders(headers, customHeaders, true));
      } else {
        LOG.debug('Skipping middleware because event is not a custom Origin-Request.');
      }
      next();
    },
  };
};

/**
 * @beta
 */
export const withRequestHeaderConfig = (customHeaderPrefix = 'x-config-'): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontRequestEvent, CloudFrontResultResponse>, next: IMiddyNextFunction) => {
      if (LambdaEdgeUtils.isCustomOriginRequestEvent(handler.event)) {
        const request: CloudFrontRequest = handler.event.Records[0].cf.request;
        const origin: CloudFrontCustomOrigin = LambdaEdgeUtils.toCloudFrontCustomOrigin(request);
        const customHeaders: IncomingHttpHeaders = findPrefixedHeaders(
          LambdaEdgeUtils.toIncomingHttpHeaders(origin.customHeaders),
          customHeaderPrefix,
          true,
        );
        Object.keys(customHeaders).forEach(header => {
          const headerValue: string | string[] = customHeaders[header] || '';
          Config.put(header, headerValue.toString());
          LOG.debug('Adding [%s] config value: %s', header, headerValue.toString());
        });
      } else {
        LOG.debug('Skipping middleware because event is not a custom Origin-Request.');
      }
      next();
    },
  };
};

/**
 * @beta
 */
export const withOriginResponseHeaders = (config: IncomingHttpHeaders): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontResponseEvent, CloudFrontResponse>, next: IMiddyNextFunction) => {
      if (LambdaEdgeUtils.isCustomOriginResponseEvent(handler.event)) {
        const response: CloudFrontResponse = handler.event.Records[0].cf.response;
        const mergedHeaders: IncomingHttpHeaders = HttpUtils.mergeHeaders(
          LambdaEdgeUtils.toIncomingHttpHeaders(response.headers),
          config,
        );
        response.headers = LambdaEdgeUtils.stripOriginResponseHeaders(
          LambdaEdgeUtils.toCloudFrontHeaders(mergedHeaders),
        );
      } else {
        LOG.debug('Skipping middleware because event is not a Origin-Response.');
      }
      next();
    },
  };
};
