import {
  DeleteObjectsRequest,
  GetObjectOutput,
  GetObjectRequest,
  HeadObjectOutput,
  PutObjectOutput,
  PutObjectRequest,
  S3,
} from '@aws-sdk/client-s3';
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

  private async headObject(fileName: string): Promise<HeadObjectOutput | undefined> {
    try {
      return await this.s3Client.headObject({ Bucket: this.bucketName, Key: fileName });
    } catch (err) {
      if (err.code !== 'NotFound') {
        throw err;
      }
    }
    return undefined;
  }

  public async size(fileName: string): Promise<number | undefined> {
    const head = await this.headObject(fileName);
    return !!head ? head.ContentLength : undefined;
  }

  public async exists(fileName: string): Promise<boolean> {
    return !!(await this.headObject(fileName));
  }

  private toDeleteObjectsRequest(keys: string[]): DeleteObjectsRequest {
    return {
      Bucket: this.bucketName,
      Delete: {
        Objects: keys.map((key) => {
          return { Key: key };
        }),
      },
    };
  }

  public async remove(...fileNames: string[]): Promise<void> {
    if (fileNames.length < 1) {
      return;
    }
    await this.s3Client.deleteObjects(this.toDeleteObjectsRequest(fileNames));
  }

  public async loadBuffer(fileName: string): Promise<Buffer> {
    const output = await this.load(fileName);
    if (!Buffer.isBuffer(output.Body)) {
      throw new Error(`Object is "${typeof output.Body}", not a Buffer.`);
    }
    return output.Body;
  }

  private toBaseObjectRequest(key: string): GetObjectRequest {
    return {
      Bucket: this.bucketName,
      Key: key,
    };
  }

  private toPutObjectRequest(
    key: string,
    content: string | Buffer | Readable,
    options: Partial<PutObjectRequest> = {},
  ): PutObjectRequest {
    const rval: PutObjectRequest = {
      ...this.toBaseObjectRequest(key),
      Body: content,
      ...options,
    };
    return rval;
  }

  public async load(fileName: string): Promise<GetObjectOutput> {
    return await this.s3Client.getObject(this.toBaseObjectRequest(fileName));
  }

  public async store(
    fileName: string,
    content: string | Buffer | Readable,
    options?: Partial<PutObjectRequest>,
  ): Promise<PutObjectOutput> {
    return await this.s3Client.putObject(this.toPutObjectRequest(fileName, content, options));
  }
}
