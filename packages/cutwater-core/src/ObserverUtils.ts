import { Observable, Observer, race } from 'rxjs';

import { LoggerFactory } from './Logging/LoggerFactory';

export class ObserverUtils {
  public static timeout<T>(
    srcObservable: Observable<T>,
    title: string,
    timeoutMillis: number,
    resolveAsNull: boolean,
  ): Observable<T> {
    return race(srcObservable, this.createTimeoutObservable(title, timeoutMillis, resolveAsNull));
  }

  public static createTimeoutObservable<T>(title: string, timeoutMillis: number, resolveAsNull: boolean): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        LoggerFactory.getLogger().warn(`Timed out after ${timeoutMillis}ms waiting for results of ${title}`);
        if (resolveAsNull) {
          observer.next(null);
          observer.complete();
        } else {
          observer.error('Timeout');
        }
      }, timeoutMillis);
    });
  }
}
