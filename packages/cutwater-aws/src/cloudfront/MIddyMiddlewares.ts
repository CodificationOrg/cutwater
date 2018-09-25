import { CloudFrontRequestEvent, CloudFrontResultResponse } from 'aws-lambda';
import { LoggerFactory, mergeHeaders } from 'cutwater-core';
import { IncomingMessage, request, RequestOptions } from 'http';
import { IHandlerLambda, IMiddyMiddlewareObject, IMiddyNextFunction } from 'middy';

import { toIncomingHttpHeaders } from './CloudfrontUtils';
import { copyOriginResponseToCloudFrontResponse } from './LambdaEdgeUtils';

const LOG = LoggerFactory.getLogger();

export interface CloudFrontRequestFilter {
  filter: (event: CloudFrontRequestEvent) => void;
}

export const withOriginResponse = (config: CloudFrontRequestFilter): IMiddyMiddlewareObject => {
  return {
    before: (handler: IHandlerLambda<CloudFrontRequestEvent, CloudFrontResultResponse>, next: IMiddyNextFunction) => {
      const options = toRequestOptions(handler.event);
      LOG.trace('Origin request options: %j', options);
      const req = request(options, (response: IncomingMessage) => {
        copyOriginResponseToCloudFrontResponse(response, handler.response, next);
      });
      req.end();
    },
  };
};

const toRequestOptions = (event: CloudFrontRequestEvent): RequestOptions => {
  const rval: RequestOptions = {};
  const req = event.Records[0].cf.request;
  const origin = req.origin.custom;
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
