import { S3 } from 'aws-sdk';
import { PutObjectOutput, PutObjectRequest } from 'aws-sdk/clients/s3';
import * as mime from 'mime';
import { Readable } from 'stream';

/**
 * @beta
 */
export class S3Bucket {
  public static toMimeType(key: string): string {
    return mime.getType(key) || '';
  }

  private bucketName: string;
  private s3Client: S3;

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

  public exists(fileName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.s3Client.headObject({ Bucket: this.bucketName, Key: fileName }, (err, data) => {
        let rval: boolean = true;
        if (err && err.code === 'NotFound') {
          rval = false;
        } else if (err) {
          return reject(err);
        }
        resolve(rval);
      });
    });
  }

  public store(
    fileName: string,
    content: string | Buffer | Readable,
    mimeType?: string,
  ): Promise<PutObjectOutput> {
    return new Promise((resolve, reject) => {
      this.s3Client.putObject(this.toPutObjectRequest(fileName, content, mimeType), (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      })
    })
  }

  // tslint:disable-next-line:no-any
  private toPutObjectRequest(key: string, content: any, mimeType?: string): PutObjectRequest {
    const rval: PutObjectRequest = {
      Body: content,
      Bucket: this.bucketName,
      ContentType: mimeType ? mimeType : S3Bucket.toMimeType(key),
      Key: key,
    };
    return rval;
  }
}
