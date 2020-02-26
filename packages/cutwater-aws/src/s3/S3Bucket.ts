import { S3 } from 'aws-sdk';
import { DeleteObjectRequest, GetObjectOutput, GetObjectRequest, PutObjectOutput, PutObjectRequest } from 'aws-sdk/clients/s3';
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

  public remove(fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3Client.deleteObject(this.toDeleteObjectRequest(fileName), (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public async loadBuffer(fileName: string): Promise<Buffer> {
    const output = await this.load(fileName);
    if (!Buffer.isBuffer(output.Body)) {
      throw new Error(`Object is ${typeof output.Body},not a Buffer.`);
    }
    return output.Body;
  }

  public load(fileName: string): Promise<GetObjectOutput> {
    return new Promise((resolve, reject) => {
      this.s3Client.getObject(this.toGetObjectRequest(fileName), (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  public store(fileName: string, content: string | Buffer | Readable, mimeType?: string): Promise<PutObjectOutput> {
    return new Promise((resolve, reject) => {
      this.s3Client.putObject(this.toPutObjectRequest(fileName, content, mimeType), (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  private toPutObjectRequest(key: string, content: string | Buffer | Readable, mimeType?: string): PutObjectRequest {
    const rval: PutObjectRequest = {
      Body: content,
      Bucket: this.bucketName,
      ContentType: mimeType ? mimeType : S3Bucket.toMimeType(key),
      Key: key,
    };
    return rval;
  }

  private toGetObjectRequest(key: string): GetObjectRequest {
    const rval: GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };
    return rval;
  }

  private toDeleteObjectRequest(key: string): DeleteObjectRequest {
    const rval: DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };
    return rval;
  }
}
