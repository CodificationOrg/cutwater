import {
  DeleteObjectsCommandInput,
  NotFound,
  PutObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';
import {
  GetObjectOutput,
  HeadObjectOutput,
  PutObjectOutput,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';
import * as mime from 'mime';
import { Readable } from 'node:stream';

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

  private async headObject(
    fileName: string
  ): Promise<HeadObjectOutput | undefined> {
    try {
      return await this.s3Client.headObject({
        Bucket: this.bucketName,
        Key: fileName,
      });
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }
    return undefined;
  }

  public async size(fileName: string): Promise<number | undefined> {
    const head = await this.headObject(fileName);
    return head ? head.ContentLength : undefined;
  }

  public async exists(fileName: string): Promise<boolean> {
    return !!(await this.headObject(fileName));
  }

  private toDeleteObjectsRequest(keys: string[]): DeleteObjectsCommandInput {
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
    this.s3Client.deleteObjects(this.toDeleteObjectsRequest(fileNames));
  }

  public async loadBuffer(fileName: string): Promise<Buffer> {
    const output = await this.load(fileName);
    if (!Buffer.isBuffer(output.Body)) {
      throw new Error(`Object is "${typeof output.Body}", not a Buffer.`);
    }
    return output.Body;
  }

  private toBaseObjectRequest(key: string): { Key: string; Bucket: string } {
    return {
      Bucket: this.bucketName,
      Key: key,
    };
  }

  private toPutObjectCommandInput(
    key: string,
    content: string | Buffer | Readable,
    options: Partial<PutObjectRequest> = {}
  ): PutObjectCommandInput {
    return {
      ...this.toBaseObjectRequest(key),
      Body: content,
      ...options,
    } as PutObjectCommandInput;
  }

  public async load(fileName: string): Promise<GetObjectOutput> {
    return this.s3Client.getObject(this.toBaseObjectRequest(fileName));
  }

  public async store(
    fileName: string,
    content: string | Buffer | Readable,
    options?: Partial<PutObjectRequest>
  ): Promise<PutObjectOutput> {
    return this.s3Client.putObject(
      this.toPutObjectCommandInput(fileName, content, options)
    );
  }
}
