import {
  CloudFrontCustomOrigin,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
  CloudFrontResponseEvent,
  CloudFrontResultResponse
} from 'aws-lambda';
import { IncomingHttpHeaders, IncomingMessage, request as HttpRequest, RequestOptions } from 'http';
import { IHandlerLambda, IMiddyMiddlewareObject, IMiddyNextFunction } from 'middy';

import { Config } from '@codification/cutwater-core';
import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { HttpUtils } from '@codification/cutwater-node-core';

import {
  isCustomOriginRequestEvent,
  isCustomOriginResponseEvent,
  originResponseToCloudFrontResultResponse,
  stripOriginResponseHeaders,
  toCloudFrontHeaders,
  toIncomingHttpHeaders
} from './LambdaEdgeUtils';

const LOG: Logger = LoggerFactory.getLogger();

// tslint:disable: interface-name
export interface OriginRequestConfig {
  filter: (request: CloudFrontRequest) => void;
}

export interface CloudFrontOriginRequestEvent extends CloudFrontRequestEvent {
  originResponse?: CloudFrontResultResponse;
}

const toRequestOptions: Function = (req: CloudFrontRequest, origin: CloudFrontCustomOrigin): RequestOptions => {
  const rval: RequestOptions = {};
  rval.protocol = origin.protocol + ':';
  rval.hostname = origin.domainName;
  rval.path = `${req.uri}${req.querystring ? '?' + req.querystring : ''}`;
  rval.method = req.method;
  rval.headers = toIncomingHttpHeaders(req.headers);
  if (origin.customHeaders) {
    rval.headers = HttpUtils.mergeHeaders(rval.headers, toIncomingHttpHeaders(origin.customHeaders));
  }
  return rval;
};

export const withOriginRequestResponse: Function = (config?: OriginRequestConfig): IMiddyMiddlewareObject => {
  return {
    before: (
      handler: IHandlerLambda<CloudFrontOriginRequestEvent, CloudFrontResultResponse>,
      next: IMiddyNextFunction
    ) => {
      if (isCustomOriginRequestEvent(handler.event)) {
        const request = handler.event.Records[0].cf.request;
        if (config) {
          config.filter(request);
        }
        const options = toRequestOptions(request, request.origin.custom);
        LOG.trace('Origin request options: %j', options);
        const req = HttpRequest(options, (response: IncomingMessage) => {
          originResponseToCloudFrontResultResponse(response)
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
    }
  };
};

const findPrefixedHeaders: Function = (
  headers: IncomingHttpHeaders,
  prefix: string,
  stripPrefix = false
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

export const withCustomOriginRequestHeaders: Function = (customHeaderPrefix = 'x-custom-'): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontRequestEvent, CloudFrontResultResponse>, next: IMiddyNextFunction) => {
      if (isCustomOriginRequestEvent(handler.event)) {
        const request = handler.event.Records[0].cf.request;
        const headers = toIncomingHttpHeaders(request.headers);
        const customHeaders = findPrefixedHeaders(
          toIncomingHttpHeaders(request.origin.custom.customHeaders),
          customHeaderPrefix,
          true
        );
        request.headers = toCloudFrontHeaders(HttpUtils.mergeHeaders(headers, customHeaders, true));
      } else {
        LOG.debug('Skipping middleware because event is not a custom Origin-Request.');
      }
      next();
    }
  };
};

export const withRequestHeaderConfig: Function = (customHeaderPrefix = 'x-config-'): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontRequestEvent, CloudFrontResultResponse>, next: IMiddyNextFunction) => {
      if (isCustomOriginRequestEvent(handler.event)) {
        const request: CloudFrontRequest = handler.event.Records[0].cf.request;
        const customHeaders: IncomingHttpHeaders = findPrefixedHeaders(
          toIncomingHttpHeaders(request.origin.custom.customHeaders),
          customHeaderPrefix,
          true
        );
        Object.keys(customHeaders).forEach(header => {
          Config.put(header, customHeaders[header].toString());
          LOG.debug('Adding [%s] config value: %s', header, customHeaders[header].toString());
        });
      } else {
        LOG.debug('Skipping middleware because event is not a custom Origin-Request.');
      }
      next();
    }
  };
};

export const withOriginResponseHeaders: Function = (config: IncomingHttpHeaders): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontResponseEvent, CloudFrontResponse>, next: IMiddyNextFunction) => {
      if (isCustomOriginResponseEvent(handler.event)) {
        const response: CloudFrontResponse = handler.event.Records[0].cf.response;
        const mergedHeaders: IncomingHttpHeaders = HttpUtils.mergeHeaders(
          toIncomingHttpHeaders(response.headers),
          config
        );
        response.headers = stripOriginResponseHeaders(toCloudFrontHeaders(mergedHeaders));
      } else {
        LOG.debug('Skipping middleware because event is not a Origin-Response.');
      }
      next();
    }
  };
};
