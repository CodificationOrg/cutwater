import { S3 } from 'aws-sdk';
import * as mime from 'mime';
import { bindNodeCallback, Observable, Observer } from 'rxjs';
import { Readable } from 'stream';

export class S3Bucket {
  private bucketName: string;
  private s3Client: S3;

  public static toMimeType(key: string): string {
    return mime.getType(key);
  }

  public constructor(bucketName: string, client?: S3) {
    this.bucketName = bucketName;
    this.s3Client = client ? client : new S3();
  }

  public setBucketName(name: string): void {
    if (!name) {
      throw new Error('Bucket name is required.');
    }
    this.bucketName = name;
  }

  public exists(fileName: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.s3Client.headObject({ Bucket: this.bucketName, Key: fileName }, (err, data) => {
        if (err && err.code === 'NotFound') {
          observer.next(false);
        } else if (err) {
          observer.error(err);
        } else {
          observer.next(true);
        }
        observer.complete();
      });
    });
  }

  public store(
    fileName: string,
    content: string | Buffer | Readable,
    mimeType?: string
  ): Observable<S3.Types.PutObjectOutput> {
    const rval: Function = bindNodeCallback<S3.Types.PutObjectRequest, S3.Types.PutObjectOutput>(
      this.s3Client.putObject
    );
    return rval(this.toPutObjectRequest(fileName, content, mimeType));
  }

  // tslint:disable-next-line:no-any
  private toPutObjectRequest(key: string, content: any, mimeType?: string): S3.Types.PutObjectRequest {
    const rval: S3.Types.PutObjectRequest = {
      Body: content,
      Bucket: this.bucketName,
      ContentType: mimeType ? mimeType : S3Bucket.toMimeType(key),
      Key: key
    };
    return rval;
  }
}
