import { IncomingHttpHeaders, IncomingMessage, OutgoingHttpHeaders } from 'http';

export class HttpUtils {
  /**
   * Returns `true` if the response status is between 200 and 399 inclusive.
   *
   * @param response - Response from the Node.js `http` module.
   */
  public static isResponseOk(response: IncomingMessage): boolean {
    return response.statusCode > 199 && response.statusCode < 400;
  }

  /**
   * Returns a `Promise` that resolves to the text data contained in the response body.
   *
   * @param response - Response from the Node.js `http` module.
   */
  public static toBodyText(response: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      this.toBuffer(response)
        .then(data => resolve(data.toString()))
        .catch(err => reject(err));
    });
  }

  /**
   * Returns a `Promise` that resolves to the text data contained in the response body.
   *
   * @param response - Response from the Node.js `http` module.
   */
  public static toBuffer(response: IncomingMessage): Promise<Buffer> {
    const rval = [];
    return new Promise<Buffer>((resolve, reject) => {
      response.on('data', chunk => {
        rval.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(rval)));
      response.on('error', err => reject(err));
    });
  }

  /**
   * Returns the result of merging the `src` headers into the initial `dst` headers.
   *
   * @param dst - The initial set of headers.
   * @param src - The headers to be merged into the `dst`.
   * @param overwrite - If `true`, headers in the `src` will overwrite existing headers in the `dst`.
   * @return A new object containing the results of the merge.
   */
  public static mergeHeaders(
    dst: IncomingHttpHeaders | OutgoingHttpHeaders,
    src: IncomingHttpHeaders | OutgoingHttpHeaders,
    overwrite = true,
  ): IncomingHttpHeaders {
    const rval = this.toIncomingHttpHeaders(dst);
    Object.keys(src).forEach(headerName => {
      if (!dst[headerName] || overwrite) {
        rval[headerName] = this.toNormalizedHeaderValue(src[headerName]);
      }
    });
    return rval;
  }

  /**
   * Converts a set of headers, either incoming or outgoing, to the incoming format used by the `http` module in Node.js.
   *
   * @param headers - Headers to be converted to the incoming format.
   */
  public static toIncomingHttpHeaders(headers: IncomingHttpHeaders | OutgoingHttpHeaders): IncomingHttpHeaders {
    const rval = {};
    Object.keys(headers).forEach(headerName => {
      rval[headerName] = this.toNormalizedHeaderValue(headers[headerName]);
    });
    return rval;
  }

  private static toNormalizedHeaderValue(value: string | string[] | number | undefined): string | string[] | undefined {
    return typeof value === 'number' ? value.toString() : value;
  }
}
