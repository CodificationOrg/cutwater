import * as got from 'got';
import { Observable, Observer } from 'rxjs';

import { IOUtils } from '../IOUtils';

export class GotUtils {
  /**
   * Returns a `Buffer` for the content at the specified url.
   *
   * @param url - The url where the data to be buffered is located.
   * @param options - Options for the `got` request.
   */
  public static fetchBodyBuffer(url: string, options?: got.GotOptions<null>): Observable<Buffer> {
    if (options) {
      options.throwHttpErrors = true;
    }
    return IOUtils.readableToBuffer(got.stream(url, options));
  }

  /**
   * Returns a `string` for the content at the specified url.
   *
   * @param url - The url where the textual data to be returned is located.
   * @param options - Options for the `got` request.
   */
  public static fetchBodyText(url: string, options?: got.GotOptions<string>): Observable<string> {
    if (options) {
      if (!options.encoding) {
        options.encoding = 'utf8';
      }
      options.throwHttpErrors = true;
    }
    return Observable.create((observer: Observer<string>) => {
      got(url, options)
        .then(response => {
          observer.next(response.body);
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }
}
