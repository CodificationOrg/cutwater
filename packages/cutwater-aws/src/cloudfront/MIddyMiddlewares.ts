import { CloudFrontCustomOrigin, CloudFrontRequest, CloudFrontRequestEvent, CloudFrontResultResponse } from 'aws-lambda';
import { LoggerFactory, mergeHeaders } from 'cutwater-core';
import { IncomingMessage, request as HttpRequest, RequestOptions } from 'http';
import { IHandlerLambda, IMiddyMiddlewareObject, IMiddyNextFunction } from 'middy';

import { isCustomOriginRequestEvent, originResponseToCloudFrontResultResponse, toIncomingHttpHeaders } from './LambdaEdgeUtils';

const LOG = LoggerFactory.getLogger();

export interface OriginRequestConfig {
  filter: (request: CloudFrontRequest) => void;
}

export interface CloudFrontOriginRequestEvent extends CloudFrontRequestEvent {
  originResponse?: CloudFrontResultResponse;
}

export const withOriginRequestResponse = (config?: OriginRequestConfig): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontOriginRequestEvent, CloudFrontResultResponse>, next: IMiddyNextFunction) => {
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
    },
  };
};

const toRequestOptions = (req: CloudFrontRequest, origin: CloudFrontCustomOrigin): RequestOptions => {
  const rval: RequestOptions = {};
  rval.protocol = origin.protocol + ':';
  rval.hostname = origin.domainName;
  rval.path = `${req.uri}${req.querystring ? '?' + req.querystring : ''}`;
  rval.method = req.method;
  rval.headers = toIncomingHttpHeaders(req.headers);
  if (origin.customHeaders) {
    rval.headers = mergeHeaders(rval.headers, toIncomingHttpHeaders(origin.customHeaders));
  }
  return rval;
};
