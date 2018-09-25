import { IncomingHttpHeaders, IncomingMessage, OutgoingHttpHeaders } from 'http';

export const isResponseOk = (response: IncomingMessage): boolean => {
  return response.statusCode > 199 && response.statusCode < 400;
};

export const toBodyText = (response: IncomingMessage): Promise<string> => {
  let rval = '';
  return new Promise<string>((resolve, reject) => {
    response.on('data', chunk => {
      rval += chunk;
    });
    response.on('end', () => resolve(rval));
    response.on('error', err => reject(err));
  });
};

export const mergeHeaders = (
  target: IncomingHttpHeaders | OutgoingHttpHeaders,
  src: IncomingHttpHeaders | OutgoingHttpHeaders,
  overwrite = true,
): IncomingHttpHeaders => {
  const rval = toIncomingHttpHeaders(target);
  Object.keys(src).forEach(headerName => {
    if (!target[headerName] || overwrite) {
      rval[headerName] = toNormalizedHeaderValue(src[headerName]);
    }
  });
  return rval;
};

export const toIncomingHttpHeaders = (headers: IncomingHttpHeaders | OutgoingHttpHeaders): IncomingHttpHeaders => {
  const rval = {};
  Object.keys(headers).forEach(headerName => {
    rval[headerName] = toNormalizedHeaderValue(headers[headerName]);
  });
  return rval;
};

const toNormalizedHeaderValue = (value: string | string[] | number | undefined): string | string[] | undefined => {
  return typeof value === 'number' ? value.toString() : value;
};
